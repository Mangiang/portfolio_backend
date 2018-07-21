const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/**
 * @api {post} /user/login Login
 * @apiGroup User
 * @apiParamExample {json} Request-Example:
 *  {
 *      login:"mylogin",
 *      password:"mypassword"
 *  }
 * @apiSuccess {Object} result The user infos
 * @apiSuccessExample {json} Success
 *  HTTP/1.1 200 OK
 *  [{
 *      firstname : "myfirstname";
 *      lastname : "mylastname"; 
 *      phone : "myphone";
 *      address : "myaddress"; 
 *      city : "mycity";
 *      zipCode : "myzipCode"; 
 *  },
 *      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjViMDY3ZGRhZWYyZjdmYTk2YTZmMmQ2MCIsImZpcnN0bmFtZSI6IkFydGh1ciIsImxhc3RuYW1lIjoiSm9seSIsInBob25lIjoibXlQaG9uZU51bWJlciIsImFkZHJlc3MiOiJNeSBhZGRyZXNzIiwiY2l0eSI6Ikl2cnktU3VyLVNlaW5lIiwiemlwQ29kZSI6Ijk0MjAwIn0sImlhdCI6MTUyODgyMzY4MiwiZXhwIjoxNTI4OTEwMDgyfQ.IcCzCEMv4ULFQ2NGOENDaONYUU0UShBKL7_oB3mAj9g" 
 *  ]
 * @apiErrorExample {json} List error
 *    HTTP/1.1 400 Not Found
 */
function Login(req, res, dbo){
    if (!req.body.login || !req.body.password)
        return res.status(400).send({ success:false, error: "no login or password provided" });


    dbo.collection("user").findOne({login:req.body.login}, function(err, result){
        if (err) {
            return res.status(500).send({success:false, error: "Error trying to login"});
        }
        if (!result)
            return res.status(400).send({ success:false, error: "login error" });
        else
        {
            const {password, login, ...user} = result 

            if (!bcrypt.compareSync(req.body.password, password))
                return res.status(400).send({ success:false, error: "Login error" });

            const payload = { user : user};
            var token = jwt.sign(payload, 'portefolio', 
            {
                expiresIn: "1d" // expires in 24 hours
            }, function(err, token) {
                if (err) throw err;
                return res.send({success:true, user:user, token:token});
            })
        }
    });
}


module.exports = {Login}