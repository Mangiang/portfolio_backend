const uuidv4 = require('uuid/v4');
const cloudinary = require('cloudinary');
const formidable = require('formidable');

cloudinary.config('cloud_name', 'dag6mrva0');
cloudinary.config('api_key', '349989267835172');
cloudinary.config('api_secret', 'HHM3DQihqlCnJttOmUx2xPBTEHo');

/**
 * @api {get} /project/list GetAllProjects
 * @apiGroup Project
 * @apiSuccess {Object[]} result The list of all projects
 * @apiSuccessExample {json} Success
 *  HTTP/1.1 200 OK
 *  [
*       {
*           "_id": "5b19d32f2cfa0deab01fd15a",
*           "id": "416ac246-e7ac-49ff-93b4-f7e94d997e6b",
*           "title": "Project1",
*           "beginDate": "2016",
*           "endDate": "2018",
*           "description": "Test project"
*       },
*       {
*           "_id": "5b19d34ed62a8ee540d59b47",
*           "id": "416ac246-e7bc-49ff-93b4-f7e94d997e6b",
*           "title": "Project1",
*           "beginDate": "2016",
*           "endDate": "2018",
*           "description": "Test project"
*       }
*   ]
* @apiErrorExample {json} List error
*   HTTP/1.1 400 Not found
*/
function GetAllProjects(req, res, dbo){
    dbo.collection("project").find({}).toArray(function(err, result){
        if (err) {
            return res.status(500).send({ success:false, error: "Error while listing projects" });
        }
        if (!result || result.length === 0)
            return res.status(204).send({ success:true});
        else
            return res.send({success:true, projects:result.reverse()});
    })
}

/**
 * @api {get} /project/detail/:id GetProjectDetail
 * @apiGroup Project
 * @apiParam {String} id A project id. Example "416ac246-e7ac-49ff-93b4-f7e94d997e6b"
 * @apiSuccess {Object} result The project infos
 * @apiSuccessExample {json} Success
 *  HTTP/1.1 200 OK
 *  {
 *      "_id": "5b19d34ed62a8ee540d59b47",
 *      "id": "416ac246-e7bc-49ff-93b4-f7e94d997e6b",
 *      "title": "Project1",
 *      "beginDate": "2016",
 *      "endDate": "2018",
 *      "description": "Test project"
 *  }
 * @apiErrorExample {json} List error
 *  HTTP/1.1 404 Not found
 */
function GetProjectDetail(req, res, dbo){
    dbo.collection("project").findOne({id:req.params.id}, function(err, result){
        if (err) {
            return res.status(500).send({ success:false, error: "Error while looking for details on project" });
        }
        if (!result)
            return res.status(404).send({success:false, error: "Could not find the requested project" });
        else
            return res.send({success:true, ...result});
    })
}

/**
 * @api {get} /project/create CreateProject
 * @apiGroup Project
 * @apiParamExample {json} Request-Example:
 *  {
 *      title:"Project1",
 *      beginDate:"2018-06-17"
 *      endDate:"2018-06-17"
 *      description:"The project description"
 *  }
 * @apiHeaderExample {json} Header-Example:
 *  {
 *      "authorization" : "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjViMjVkZmU2YTEwMTE0M2RhMjIzMjdmNSIsImZpcnN0bmFtZSI6IkFydGh1ciIsImxhc3RuYW1lIjoiSm9seSIsInBob25lIjoibXlQaG9uZU51bWJlciIsImFkZHJlc3MiOiJNeSBhZGRyZXNzIiwiY2l0eSI6Ikl2cnktU3VyLVNlaW5lIiwiemlwQ29kZSI6Ijk0MjAwIn0sImlhdCI6MTUyOTI0NjgwNiwiZXhwIjoxNTI5MzMzMjA2fQ.KnqY8_QY4HQZs1Iw-S3k2TLebFGm8KmWk6K1uqP3tlY"
 *  }
 * @apiSuccess {Object} result The project
 * @apiSuccessExample {json} Success
 *  HTTP/1.1 201 Created
 *  {
 *  "416ac246-e7ac-49ff-93b4-f7e94d997e6b"
 *  }
 * @apiErrorExample {json} List error
 *  HTTP/1.1 500 Internal Server Error
 *  HTTP/1.1 400 Bad Request
 */
function CreateProject(req, res, dbo){
    const id = uuidv4();

    if (!req.body.title)
            return res.status(400).send({success: false, error: "No title provided" });
    if (!req.body.beginDate)
            return res.status(400).send({success: false, error: "No begin date provided" });


    dbo.collection("project").insertOne({
        id: id,
        title : req.body.title,
        beginDate : req.body.beginDate,
        endDate : req.body.endDate,
        description : req.body.description,
        smallDescription: req.body.smallDescription
    }, 
    function(err, result) {
        if (err) 
        {
            return res.status(500).send({success: false, error: "Error while creating a project" });
        }
        else
            return res.status(201).send({success: true, id:id});
    })
}

/**
 * @api {post} /project/upload/:id UploadImage
 * @apiGroup Project
 * @apiParam {String} id Project id. Example: "416ac246-e7bc-49ff-93b4-f7e94d997e6b"
 * @apiSuccess {Object} result The image url
 * @apiSuccessExample {json} Success
 *  HTTP/1.1 201 Created
 *  { 
 *      success: true,
 *  }
 * @apiHeaderExample {json} Header-Example:
 *  {
 *      "authorization" : "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjViMjVkZmU2YTEwMTE0M2RhMjIzMjdmNSIsImZpcnN0bmFtZSI6IkFydGh1ciIsImxhc3RuYW1lIjoiSm9seSIsInBob25lIjoibXlQaG9uZU51bWJlciIsImFkZHJlc3MiOiJNeSBhZGRyZXNzIiwiY2l0eSI6Ikl2cnktU3VyLVNlaW5lIiwiemlwQ29kZSI6Ijk0MjAwIn0sImlhdCI6MTUyOTI0NjgwNiwiZXhwIjoxNTI5MzMzMjA2fQ.KnqY8_QY4HQZs1Iw-S3k2TLebFGm8KmWk6K1uqP3tlY"
 *  }
 * @apiErrorExample {json} List error
 *  HTTP/1.1 400 Bad request
 *  HTTP/1.1 503 Service Unavailable
 */
function UploadImage(req, res, dbo)
{
    let form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        cloudinary.uploader.upload(files.image.path, (result) => {
            if (result){
                dbo.collection("project").update({id : req.params.id},{ $addToSet: {images : {id: result.public_id, url:result.secure_url}} },
                function(err, result){
                    if (err) 
                        return res.status(500).send({success:false, error: "Error updating the database" });
                });
                if (!result.public_id || !result.secure_url)
                    return res.status(500).send({success:false, error: "Error updating images" });
                return res.status(201).send({success:true});
            }
            return res.status(500).send({success:false, error: err});
        });
    })
}

/**
 * @api {delete} /project/deleteImage/:id DeleteImage
 * @apiGroup Project
 * @apiParam {String} id Project id. Example: "416ac246-e7bc-49ff-93b4-f7e94d997e6b"
 * @apiParamExample {json} Request-Example:
 *  {
 *      imageId:"zups7jgi5bmsmxkj6wnb"
 *  }
 * @apiHeaderExample {json} Header-Example:
 *  {
 *      "authorization" : "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjViMjVkZmU2YTEwMTE0M2RhMjIzMjdmNSIsImZpcnN0bmFtZSI6IkFydGh1ciIsImxhc3RuYW1lIjoiSm9seSIsInBob25lIjoibXlQaG9uZU51bWJlciIsImFkZHJlc3MiOiJNeSBhZGRyZXNzIiwiY2l0eSI6Ikl2cnktU3VyLVNlaW5lIiwiemlwQ29kZSI6Ijk0MjAwIn0sImlhdCI6MTUyOTI0NjgwNiwiZXhwIjoxNTI5MzMzMjA2fQ.KnqY8_QY4HQZs1Iw-S3k2TLebFGm8KmWk6K1uqP3tlY"
 *  }
 * @apiSuccess {Object} result The project id
 * @apiSuccessExample {json} Success
 *  HTTP/1.1 204 No Content
 * @apiErrorExample {json} List error
 *  HTTP/1.1 500 Internal Server Error
 */
function DeleteImage(req, res, dbo){
    if (!req.body || !req.body.imageId)
        return res.status(400).send({success:false, error: "No id provided"});
    
    cloudinary.uploader.destroy(req.body.imageId, (result) => console.log(result));

    const result = dbo.collection("project").update({id : req.params.id}, {$pull:{images:{$elemMatch: {id:req.body.imageId}}}},
    function(err, result){
        if (err) 
            return res.status(500).send({success:false, error: "Error updating the database" });
        else
            return res.status(204).send({success:true, result});
    })
}

/**
 * @api {put} /project/update/:id UpdateProject
 * @apiGroup Project
 * @apiParam {String} id Project id. Example: "416ac246-e7bc-49ff-93b4-f7e94d997e6b"
 * @apiSuccess {Object} result The project id
 * @apiSuccessExample {json} Success
 *  HTTP/1.1 200 OK
 *  {
 *      "416ac246-e7ac-49ff-93b4-f7e94d997e6b"
 *  }
 * @apiParamExample {json} Request-Example:
 *  {
 *      title:"Project1",
 *      beginDate:"2018-06-17"
 *      endDate:"2018-06-17"
 *      description:"The project description"
 *  }
 * @apiHeaderExample {json} Header-Example:
 *  {
 *      "authorization" : "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjViMjVkZmU2YTEwMTE0M2RhMjIzMjdmNSIsImZpcnN0bmFtZSI6IkFydGh1ciIsImxhc3RuYW1lIjoiSm9seSIsInBob25lIjoibXlQaG9uZU51bWJlciIsImFkZHJlc3MiOiJNeSBhZGRyZXNzIiwiY2l0eSI6Ikl2cnktU3VyLVNlaW5lIiwiemlwQ29kZSI6Ijk0MjAwIn0sImlhdCI6MTUyOTI0NjgwNiwiZXhwIjoxNTI5MzMzMjA2fQ.KnqY8_QY4HQZs1Iw-S3k2TLebFGm8KmWk6K1uqP3tlY"
 *  }
 * @apiErrorExample {json} List error
 *  HTTP/1.1 500 Internal Server Error
 */
function UpdateProject(req, res, dbo){
    //TODO: Check if the body is valid
    dbo.collection("project").update({id : req.params.id},{ $set: req.body }, 
    function(err, result){
        if (err) 
        {
            return res.status(500).send({success:false, error: "Error updating a project" });
        }
        else
            return res.status(200).send({success:true,id:req.params.id});
    })
}

/**
 * @api {delete} /project/delete/:id DeleteProject
 * @apiGroup Project
 * @apiParam {String} id Project id. Example: "416ac246-e7bc-49ff-93b4-f7e94d997e6b"
 * @apiHeaderExample {json} Header-Example:
 *  {
 *      "authorization" : "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjViMjVkZmU2YTEwMTE0M2RhMjIzMjdmNSIsImZpcnN0bmFtZSI6IkFydGh1ciIsImxhc3RuYW1lIjoiSm9seSIsInBob25lIjoibXlQaG9uZU51bWJlciIsImFkZHJlc3MiOiJNeSBhZGRyZXNzIiwiY2l0eSI6Ikl2cnktU3VyLVNlaW5lIiwiemlwQ29kZSI6Ijk0MjAwIn0sImlhdCI6MTUyOTI0NjgwNiwiZXhwIjoxNTI5MzMzMjA2fQ.KnqY8_QY4HQZs1Iw-S3k2TLebFGm8KmWk6K1uqP3tlY"
 *  }
 * @apiSuccess {Object} result The project id
 * @apiSuccessExample {json} Success
 *  HTTP/1.1 204 No Content
 * @apiErrorExample {json} List error
 *  HTTP/1.1 500 Internal Server Error
 */
function DeleteProject(req, res, dbo){
    dbo.collection("project").deleteOne({id : req.params.id},
    function(err, result){
        if (err) 
        {
            return res.status(500).send({success:false, error: "Error deleting a project" });
        }
        else
            return res.status(204).send({success:true});
    })
}

module.exports = {CreateProject, UploadImage, DeleteImage, GetAllProjects, GetProjectDetail, UpdateProject, DeleteProject};