process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const supertest = require("supertest");
const should = require("should");
const https = require('https');
const bcrypt = require('bcrypt');
const fs = require('fs');
const mongoClient = require('mongodb').MongoClient;
const {app, InitRoutes} = require('../src/server');
const server = supertest.agent("https://localhost:8888");
const mongoUrl = 'mongodb://localhost:27017/portefolio';

describe("Timeline route testing", () => {
    let httpsServer;
    let token;
    let timelineId;

    before((done) => {
        mongoClient.connect(mongoUrl, function(err, client){
            if (err) throw err;
            dbo = client.db('portefolioTest');
            InitRoutes(dbo);
            dbo.collection("timeline").drop((err, delOk) => console.log("[timelineRoute][before] dropped timelines"));
            dbo.collection("user").drop((err, delOk) => console.log("[timelineRoute][before] dropped users"));

            bcrypt.hash("test", 10, (err, hash) => {
                dbo.collection("user").insertOne({
                    firstname : "Test",
                    lastname : "Test",
                    phone : "myPhoneNumberTest",
                    address : "My addressTest",
                    city : "cityTest",
                    zipCode : "Test",
                    login : "test",
                    password : hash
                }, (err, res) => {
                    console.log("[timelineRoute][before] Added user test")
                    httpsServer = https.createServer({
                                        key: fs.readFileSync('/etc/letsencrypt/live/arthur-joly.fr/privkey.pem'),
                                        cert: fs.readFileSync('/etc/letsencrypt/live/arthur-joly.fr/cert.pem'),
                                        passphrase: '1234'
                                        }, app);
                    httpsServer.listen(8888, () => {
                        console.log("[timelineRoute][before] The server started on port 8888"); 
                        server.post("/user/login").send({
                            login:"test",
                            password:"test"
                        }).end((err, res) => {
                            token = res.body.token;
                            done();
                            });
                    });
                });
            })

        })
    })

    describe("GET timeline/list", () => {
        it("Empty list",(done) => {
            server.get("/timeline/list").end((err, res) => {
                res.status.should.equal(204);
                res.body.should.be.an.instanceOf(Object);
                done();
            });
        });
    });

    describe("POST timeline/create", () => {
        it("Create a valid timeline", (done) => {
            server.post("/timeline/create").send({
                title:"TimelineTest",
                beginDate:"2018-06-17",
                endDate:"2018-06-17",
                description:"Test Description"
            })
            .set("authorization", "Bearer " + token)
            .end((err, res) => {
                res.body.should.be.an.instanceOf(Object);
                res.body.success.should.equal(true);
                res.body.id.should.be.an.instanceOf(String);
                timelineId = res.body.id;
                done();
            })
        })
        it("Fail creating a timeline without title", (done) => {
            server.post("/timeline/create").send({
                beginDate:"2018-06-17",
                endDate:"2018-06-17",
                description:"Test Description"
            })
            .set("authorization", "Bearer " + token)
            .end((err, res) => {
                res.body.should.be.an.instanceOf(Object);
                res.body.success.should.equal(false);
                done();
            })
        })
        it("Fail creating a timeline withou beginDate", (done) => {
            server.post("/timeline/create").send({
                title:"TimelineTest",
                endDate:"2018-06-17",
                description:"Test Description"
            })
            .set("authorization", "Bearer " + token)
            .end((err, res) => {
                res.body.should.be.an.instanceOf(Object);
                res.body.success.should.equal(false);
                done();
            })
        })
    })
    
    describe("GET timeline/list", () => {
        it("Non empty list",(done) => {
            server.get("/timeline/list").end((err, res) => {
                res.status.should.equal(200);
                res.body.should.be.an.instanceOf(Object);
                res.body.timelines.should.be.instanceOf(Array).and.have.lengthOf(1);
                res.body.success.should.equal(true);
                done();
            });
        });
    });
    describe("GET timeline/detail/:id", () => {
        it("Existing timeline without authorization",(done) => {
            server.get("/timeline/detail/"+timelineId)
            .end((err, res) => {
                res.status.should.equal(200);
                res.body.should.be.an.instanceOf(Object);
                res.body.success.should.equal(true);
                done();
            });
        });
        it("Existing timeline with authorization",(done) => {
            server.get("/timeline/detail/"+timelineId)
            .set("authorization", "Bearer " + token)
            .end((err, res) => {
                res.status.should.equal(200);
                res.body.should.be.an.instanceOf(Object);
                res.body.success.should.equal(true);
                done();
            });
        });
        it("Non existing timeline without authorization",(done) => {
            server.get("/timeline/detail/1221-1212-AZ3")
            .end((err, res) => {
                res.status.should.equal(404);
                res.body.should.be.an.instanceOf(Object);
                res.body.success.should.equal(false);
                done();
            });
        });
        it("Non existing timeline with authorization",(done) => {
            server.get("/timeline/detail/1221-1212-AZ3")
            .set("authorization", "Bearer " + token)
            .end((err, res) => {
                res.status.should.equal(404);
                res.body.should.be.an.instanceOf(Object);
                res.body.success.should.equal(false);
                done();
            });
        });
    });
    
    describe("DELETE timeline/delete/:id", () => {
        it("Delete existing timeline without authorization",(done) => {
            server.delete("/timeline/delete/" + timelineId)
            .end((err, res) => {
                res.status.should.equal(400);
                res.body.should.be.an.instanceOf(Object);
                res.body.success.should.equal(false);
                done();
            });
        });
        it("Delete existing timeline with authorization",(done) => {
            server.delete("/timeline/delete/" + timelineId)
            .set("authorization", "Bearer " + token)
            .end((err, res) => {
                res.status.should.equal(204);
                res.body.should.be.an.instanceOf(Object);
                done();
            });
        });
        it("Delete non existing timeline without authorization",(done) => {
            server.delete("/timeline/delete/" + timelineId)
            .end((err, res) => {
                res.status.should.equal(400);
                res.body.should.be.an.instanceOf(Object);
                res.body.success.should.equal(false);
                done();
            });
        });
        it("Delete non existing timeline with authorization",(done) => {
            server.delete("/timeline/delete/" + timelineId)
            .set("authorization", "Bearer " + token)
            .end((err, res) => {
                res.status.should.equal(204);
                res.body.should.be.an.instanceOf(Object);
                done();
            });
        });
    });

    after(done => {
        dbo.dropDatabase((err, delOk) => {
            console.log("[timelineRoute][after] dropped portefolioTest");
            httpsServer.close(done);
        });
    })
});
