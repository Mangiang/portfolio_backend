const express = require('express');
const bodyParser = require('body-parser');
const minify = require('express-minify');
const cors = require('cors');
const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');

const userRoute = require('./userRoute');
const projectRoute = require('./projectRoute');
const timelineRoute = require('./timelineRoute');

/**
 * 
 * API initialisation
 */
const app = express();
app.use(cors());
app.use(minify());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static('public'));

function InitRoutes(dbo){
    // Login
    app.post('/api/user/login', (req, res) => userRoute.Login(req,res, dbo));
    // Project
    app.get('/api/project/list', (req, res) => projectRoute.GetAllProjects(req, res, dbo));
    app.get('/api/project/detail/:id', (req, res) => projectRoute.GetProjectDetail(req, res, dbo));
    app.post('/api/project/create', (req, res) => VerifyToken(req, res, dbo, projectRoute.CreateProject));
    app.put('/api/project/update/:id', (req, res) => VerifyToken(req, res, dbo, projectRoute.UpdateProject));
    app.delete('/api/project/delete/:id', (req, res) => VerifyToken(req, res, dbo, projectRoute.DeleteProject));
    //Image project
    app.post('/api/project/upload/:id', (req, res) => VerifyToken(req, res, dbo, projectRoute.UploadImage));
    app.delete('/api/project/deleteImage/:id', (req, res) => VerifyToken(req, res, dbo, projectRoute.DeleteImage));
    // Timeline date
    app.get('/api/timeline/list', (req, res) => timelineRoute.GetAllTimelines(req, res, dbo));
    app.get('/api/timeline/detail/:id', (req, res) => timelineRoute.GetTimelineDetail(req, res, dbo));
    app.post('/api/timeline/create', (req, res) => VerifyToken(req, res, dbo, timelineRoute.CreateTimeline));
    app.put('/api/timeline/update/:id', (req, res) => VerifyToken(req, res, dbo, timelineRoute.UpdateTimeline));
    app.delete('/api/timeline/delete/:id', (req, res) => VerifyToken(req, res, dbo, timelineRoute.DeleteTimeline))
}

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

module.exports = {app, InitRoutes};