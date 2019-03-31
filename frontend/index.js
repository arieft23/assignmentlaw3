const express = require('express')
const app = express()
const fileupload = require('express-fileupload')
const request = require('request')
const cors = require('cors')
const rs = require('randomstring')

app.use(fileupload())
app.use(cors())

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use(express.static('public'))

app.route("/api/data")
    .post((req, res)=>{
        if (Object.keys(req.files).length == 0) {
            return res.status(400).send('No files were uploaded.');
        }
        const key = rs.generate(40)
        request.post({
            headers :{'X-ROUTING-KEY' : key},
            url : "http://localhost:3001/upload",
            formData : {
                file : {
                    value : req.files.file.data,
                    options : {
                        filename : req.files.file.name,
                        contentType : req.files.file.mimetype
                    }
                }
            }
        }, (err, response, body) => {
            if(err){
                return res.status(500).send(err)
            }
            res.redirect("/?key="+key)
        })
    })

app.listen(3000, ()=>{
    console.log("server running on port 3000")
})