const uuidv4 = require('uuid/v4');

/**
 * @api {get} /timeline/list GetAllTimelines
 * @apiGroup Timeline
 * @apiSuccess {Object[]} result The list of all timeline dates
 * @apiSuccessExample {json} Success
 *  HTTP/1.1 200 OK
 *  [
*       {
*           "_id": "5b19d32f2cfa0deab01fd15a",
*           "id": "416ac246-e7ac-49ff-93b4-f7e94d997e6b",
*           "title": "Date1",
*           "beginDate": "2016",
*           "endDate": "2018",
*           "description": "Test date"
*       },
*       {
*           "_id": "5b19d34ed62a8ee540d59b47",
*           "id": "416ac246-e7bc-49ff-93b4-f7e94d997e6b",
*           "title": "Date1",
*           "beginDate": "2016",
*           "endDate": "2018",
*           "description": "Test date"
*       }
*   ]
* @apiErrorExample {json} List errorl
*   HTTP/1.1 400 Not found
*/
function GetAllTimelines(req, res, dbo){
    dbo.collection("timeline").find({}).toArray(function(err, result){
        if (err) 
            return res.status(500).send({success:false, error: "Error listing timeline dates" });
        if (!result || result.length === 0)
            return res.status(204).send({success:false, error: "No timeline found" });
        else
            return res.send({success:true, timelines:result.sort(function(a, b) {
                return a.beginDate < b.beginDate;
            })});
    })
}

/**
 * @api {get} /timeline/detail/:id GetTimelineDetail
 * @apiGroup Timeline
 * @apiParam {String} id Timeline date id. Example: "416ac246-e7bc-49ff-93b4-f7e94d997e6b"
 * @apiSuccess {Object} result The timeline date infos
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *      "_id": "5b19d34ed62a8ee540d59b47",
 *      "id": "416ac246-e7bc-49ff-93b4-f7e94d997e6b",
 *      "title": "Date1",
 *      "beginDate": "2016",
 *      "endDate": "2018",
 *      "description": "Test date"
 *    }
 * @apiErrorExample {json} List error
 *    HTTP/1.1 400 Not found
 */
function GetTimelineDetail(req, res, dbo){
    dbo.collection("timeline").findOne({id:req.params.id}, function(err, result){
        if (err) 
            return res.status(500).send({success:false, error: "Error searching details on a timeline date" });
        if (!result)
            return res.status(404).send({success:false, error: "Could not find a timeline date with given id" });
        else
            return res.send({success:true, ...result});
    })
}

/**
 * @api {get} /timeline/create CreateTimeline
 * @apiGroup Timeline
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
 * @apiSuccess {Object} result The timeline
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *      "416ac246-e7ac-49ff-93b4-f7e94d997e6b"
 *    }
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */
function CreateTimeline(req, res, dbo){

    if (!req.body.title)
            return res.status(400).send({success: false, error: "No title provided" });
    if (!req.body.beginDate)
            return res.status(400).send({success: false, error: "No begin date provided" });
    
            const id = uuidv4();
    dbo.collection("timeline").insertOne({
        id: id,
        title : req.body.title,
        beginDate : req.body.beginDate,
        endDate : req.body.endDate,
        description : req.body.description
    }, 
    function(err, result){
        if (err) 
        {
            return res.status(500).send({sucess:false, error: "Error creating a timeline date" });
        }
        else
            return res.send({success: true, id:id});
    })
}

/**
 * @api {put} /timeline/update/:id UpdateTimeline
 * @apiGroup Timeline
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
 * @apiParam {String} id Timeline date id. Example: "416ac246-e7bc-49ff-93b4-f7e94d997e6b"
 * @apiSuccess {Object} result The timeline id
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *      "416ac246-e7ac-49ff-93b4-f7e94d997e6b"
 *    }
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 *    HTTP/1.1 400 Bad request
 *    HTTP/1.1 404 Not Found
 */
function UpdateTimeline(req, res, dbo){
    dbo.collection("timeline").update({id : req.params.id},{ $set: req.body }, 
    function(err, result){
        if (err) 
        {
            return res.status(500).send({sucess:false, error: "Error updating a timeline date" });
        }
        else
            return res.status(200).send({sucess:true, id:req.params.id});
    })
}

/**
 * @api {delete} /timeline/delete/:id DeleteTimeline
 * @apiGroup Timeline
 * @apiParam {String} id Timeline date id. Example: "416ac246-e7bc-49ff-93b4-f7e94d997e6b"
 * @apiHeaderExample {json} Header-Example:
 *  {
 *      "authorization" : "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjViMjVkZmU2YTEwMTE0M2RhMjIzMjdmNSIsImZpcnN0bmFtZSI6IkFydGh1ciIsImxhc3RuYW1lIjoiSm9seSIsInBob25lIjoibXlQaG9uZU51bWJlciIsImFkZHJlc3MiOiJNeSBhZGRyZXNzIiwiY2l0eSI6Ikl2cnktU3VyLVNlaW5lIiwiemlwQ29kZSI6Ijk0MjAwIn0sImlhdCI6MTUyOTI0NjgwNiwiZXhwIjoxNTI5MzMzMjA2fQ.KnqY8_QY4HQZs1Iw-S3k2TLebFGm8KmWk6K1uqP3tlY"
 *  }
 * @apiSuccess {Object} result The timeline id
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 204 No Content
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */
function DeleteTimeline(req, res, dbo){
    dbo.collection("timeline").deleteOne({id : req.params.id},
    function(err, result){
        if (err) 
        {
            return res.status(500).send({success:false, error: "Error deleting a timeline date" });
        }
        else
            return res.status(204).send({success:true});
    })
}

module.exports = {GetAllTimelines, GetTimelineDetail, CreateTimeline, UpdateTimeline, DeleteTimeline}