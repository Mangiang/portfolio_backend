process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const supertest = require("supertest");
const should = require("should");
const bcrypt = require('bcrypt')
const {app, InitRoutes} = require('../src/server');
const mongoClient = require('mongodb').MongoClient;
const https = require('https');
const fs = require('fs');
const server = supertest.agent("https://localhost:8888");
const mongoUrl = 'mongodb://localhost:27017/portefolio'


describe("Project route testing", () => {
    let httpsServer;
    before((done) => {
        mongoClient.connect(mongoUrl, function(err, client){
            if (err) throw err;
            dbo = client.db('portefolioTest');
            InitRoutes(dbo);
            dbo.collection("project").drop((err, delOk) => console.log("[projectRoute][before] dropped projects"));
            dbo.collection("user").drop((err, delOk) => console.log("[projectRoute][before] dropped users"));

            bcrypt.hash("test", 10, (err, hash) => {
                dbo.collection("user").insertOne({
                    firstname : "Test",
                    lastname : "Test",
                    phone : "myPhoneNumberTest",
                    login : "test",
                    password : hash
                }, (err, res) => {
                    console.log("[projectRoute][before] Added user test")
                    httpsServer = https.createServer({
                                        key: fs.readFileSync('/etc/letsencrypt/live/arthur-joly.fr/privkey.pem'),
                                        cert: fs.readFileSync('/etc/letsencrypt/live/arthur-joly.fr/cert.pem'),
                                        passphrase: '1234'
                                        }, app);
                    httpsServer.listen(8888, () => {
                        console.log("[projectRoute][before] The server started on port 8888"); 
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

    describe("GET project/list", () => {
        it("Empty list",(done) => {
            server.get("/project/list").end((err, res) => {
                res.status.should.equal(204);
                res.body.should.be.an.instanceOf(Object);
                done();
            });
        });
    });

    describe("POST project/create", () => {
        it("Create a valid project", (done) => {
            server.post("/project/create").send({
                title:"ProjectTest",
                beginDate:"2018-06-17",
                endDate:"2018-06-17",
                description:"Test Description"
            })
            .set("authorization", "Bearer " + token)
            .end((err, res) => {
                res.body.should.be.an.instanceOf(Object);
                res.body.success.should.equal(true);
                res.body.id.should.be.an.instanceOf(String);
                projectId = res.body.id;
                done();
            })
        })
        it("Fail creating a project without title", (done) => {
            server.post("/project/create").send({
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
        it("Fail creating a project withou beginDate", (done) => {
            server.post("/project/create").send({
                title:"ProjectTest",
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
    
    describe("GET project/list", () => {
        it("Non empty list",(done) => {
            server.get("/project/list").end((err, res) => {
                res.status.should.equal(200);
                res.body.should.be.an.instanceOf(Object);
                res.body.projects.should.be.instanceOf(Array).and.have.lengthOf(1);
                res.body.success.should.equal(true);
                done();
            });
        });
    });
    describe("GET project/detail/:id", () => {
        it("Existing project without authorization",(done) => {
            server.get("/project/detail/"+projectId)
            .end((err, res) => {
                res.status.should.equal(200);
                res.body.should.be.an.instanceOf(Object);
                res.body.success.should.equal(true);
                done();
            });
        });
        it("Existing project with authorization",(done) => {
            server.get("/project/detail/"+projectId)
            .set("authorization", "Bearer " + token)
            .end((err, res) => {
                res.status.should.equal(200);
                res.body.should.be.an.instanceOf(Object);
                res.body.success.should.equal(true);
                done();
            });
        });
        it("Non existing project without authorization",(done) => {
            server.get("/project/detail/1221-1212-AZ3")
            .end((err, res) => {
                res.status.should.equal(404);
                res.body.should.be.an.instanceOf(Object);
                res.body.success.should.equal(false);
                done();
            });
        });
        it("Non existing project with authorization",(done) => {
            server.get("/project/detail/1221-1212-AZ3")
            .set("authorization", "Bearer " + token)
            .end((err, res) => {
                res.status.should.equal(404);
                res.body.should.be.an.instanceOf(Object);
                res.body.success.should.equal(false);
                done();
            });
        });
    });
    
    describe("DELETE project/delete/:id", () => {
        it("Delete existing project without authorization",(done) => {
            server.delete("/project/delete/" + projectId)
            .end((err, res) => {
                res.status.should.equal(400);
                res.body.should.be.an.instanceOf(Object);
                res.body.success.should.equal(false);
                done();
            });
        });
        it("Delete existing project with authorization",(done) => {
            server.delete("/project/delete/" + projectId)
            .set("authorization", "Bearer " + token)
            .end((err, res) => {
                res.status.should.equal(204);
                res.body.should.be.an.instanceOf(Object);
                done();
            });
        });
        it("Delete non existing project without authorization",(done) => {
            server.delete("/project/delete/" + projectId)
            .end((err, res) => {
                res.status.should.equal(400);
                res.body.should.be.an.instanceOf(Object);
                res.body.success.should.equal(false);
                done();
            });
        });
        it("Delete non existing project with authorization",(done) => {
            server.delete("/project/delete/" + projectId)
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
            console.log("[projectRoute][after] dropped portefolioTest");
            httpsServer.close(done);
        });
    })
});
