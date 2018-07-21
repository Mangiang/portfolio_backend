const mongoClient = require('mongodb').MongoClient;
const https = require('https');
const fs = require('fs');

const {app, InitRoutes} = require('./server');

/**
 * Mongo initialisation
 */
const mongoUrl = 'mongodb://localhost:27017/portefolio'
let httpsServer;

mongoClient.connect(mongoUrl, function(err, client){
    if (err) throw err;
    dbo = client.db('portefolio');
    InitRoutes(dbo);
    httpsServer = https.createServer({
                        key: fs.readFileSync('/etc/letsencrypt/live/arthur-joly.fr/privkey.pem'),
                        cert: fs.readFileSync('/etc/letsencrypt/live/arthur-joly.fr/cert.pem'),
                        passphrase: '1234'
                        }, app);
    httpsServer.listen(4242, () => console.log("The server started on port 4242"));
})

function VerifyToken(req, res, dbo, callback)
{
    const bearerHeader = req.headers["authorization"];
    if (!bearerHeader)
        return res.status(400).send({success:false, error: "No token provided"});

    const bearerToken = bearerHeader.split(' ')[1];
    jwt.verify(bearerToken, 'portefolio', (err, authData) => {
        if (err) {
            return res.status(403).send({success:false, error:"Wrong token"});
        }
        else
            return callback(req, res, dbo);
    })
}

module.exports = app;


