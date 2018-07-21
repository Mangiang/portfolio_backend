process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const supertest = require("supertest");
const should = require("should");

const {app, InitRoutes} = require('../src/server');
const mongoClient = require('mongodb').MongoClient;
const https = require('https');
const fs = require('fs');
const bcrypt = require('bcrypt');
const server = supertest.agent("https://localhost:8888");
const mongoUrl = 'mongodb://localhost:27017/portefolio';


describe("User route testing", () => {
    let httpsServer;

    before((done) => {
        mongoClient.connect(mongoUrl, function(err, client){
            if (err) throw err;
            dbo = client.db('portefolioTest');
            InitRoutes(dbo);
            dbo.collection("user").drop((err, delOk) => console.log("[userRoute][before] dropped users"));
            bcrypt.hash("test", 10, (err, hash) => {
                dbo.collection("user").insertOne({
                    firstname : "Test",
                    lastname : "Test",
                    phone : "myPhoneNumberTest",
                    login : "test",
                    password : hash
                }, (err, res) => {
                    console.log("[userRoute][before] Added user test");
                    httpsServer = https.createServer({
                                        key: fs.readFileSync('/etc/letsencrypt/live/arthur-joly.fr/privkey.pem'),
                                        cert: fs.readFileSync('/etc/letsencrypt/live/arthur-joly.fr/cert.pem'),
                                        passphrase: '1234'
                                        }, app);
                    httpsServer.listen(8888, () => {console.log("[userRoute][before] The server started on port 8888"); done()});
                });
            })
        })
    });

    describe("POST user/login", () => {
        it("Fail login",(done) => {
            server.post("/user/login").expect(400).end((err, res) => {
                res.status.should.equal(400);
                res.body.should.be.an.instanceOf(Object);
                res.body.success.should.equal(false);
                done();
            });
        });
        it("Successfull login",(done) => {
            server.post("/user/login").send({
                login:"test",
                password:"test"
            }).expect(400).end((err, res) => {
                res.status.should.equal(200);
                res.body.should.be.an.instanceOf(Object);
                res.body.success.should.equal(true);
                res.body.user.should.be.an.instanceOf(Object);
                res.body.token.should.be.an.instanceOf(String);
                done();
            });
        });
    });

    after(done => {
        dbo.dropDatabase((err, delOk) => {
            console.log("[userRoute][after] dropped portefolioTest"); 
            httpsServer.close(done);
        });
        httpsServer.close(done)
    })
});
