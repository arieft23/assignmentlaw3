const express = require('express')
const app = express()
const fileupload = require('express-fileupload')
const request = require('request')
const rs = require('randomstring')

app.use(fileupload())
app.engine('ejs', require('ejs').renderFile)
app.set('view engine', 'ejs')

app.get('/', (req, res) =>{
    res.render('index', {key : null})
})

app.route("/upload")
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
            if(err || JSON.parse(body).status != "ok"){
                console.log(body)
                return res.status(200).send("Tidak berhasil upload")
            }
            res.render('index', {key:key})
        })
    })

app.listen(3000, ()=>{
    console.log("server running on port 3000")
})