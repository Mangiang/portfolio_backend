const supertest = require("supertest");
const should = require("should");
const http = require('http');
const {app, InitRoutes} = require('../src/server');
const mongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const server = supertest.agent("http://localhost:8888/api");
const mongoUrl = 'mongodb://localhost:27017/portefolio';


describe("User route testing", () => {
    let httpServer;

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
                    httpServer = http.createServer(app).listen(8888, () => {console.log("[userRoute][before] The server started on port 8888"); done()});
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
            httpServer.close(done);
        });
    })
});
