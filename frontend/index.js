const express = require('express')
const app = express()
const fileupload = require('express-fileupload')
const request = require('request')

app.use(fileupload())

app.use(express.static('public'))

app.route("/api/data")
    .post((req, res)=>{
        if (Object.keys(req.files).length == 0) {
            return res.status(400).send('No files were uploaded.');
        }
        let file = req.files.file
        request.post({
            url : "http://localhost:3001/upload",
            formData : {
                file : {
                    value : file.data,
                    options : {
                        filename : file.name,
                        contentType : file.mimetype
                    }
                }
            }
        }, (err, response, body) => {
            if(err){
                return res.status(500).send(err)
            }
            res.send(body)
        })
    })

app.listen(3000, ()=>{
    console.log("server running on port 3000")
})