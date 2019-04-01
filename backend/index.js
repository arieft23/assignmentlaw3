// libary
const express = require('express')
const amqplib = require('amqplib/callback_api')
const fileupload = require('express-fileupload')
var fs = require('fs');
var archiver = require('archiver');

const location = __dirname + '/data/'

const app = express()
app.use(fileupload())
let channel = null

app.use("/data",express.static('data'))

app.post("/upload", (req, res) => {
    const routeKey = req.headers['x-routing-key']
    const filename = req.files.file.name
    const totalSize = req.files.file.size
    req.files.file.mv(location + filename, err => {
        if (err) {
            return res.status(500).send("ada error")
        }
        handleUpload(filename, totalSize, (response) => {
            handlePublish(response, routeKey)
        })
        
    })
    res.json({ status: "ok" })
})

const handlePublish = (msg, routeKey) =>{
    const ex = "1506689061"
    channel.assertExchange(ex, "direct", {durable: false})
    channel.publish(ex, routeKey, Buffer.from(JSON.stringify(msg)))
}

const handleUpload = (filename, totalSize, callback) => {
    setTimeout(() => {
        var archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        var output = fs.createWriteStream(location + filename + ".zip");
        var input = fs.createReadStream(location + filename)
        let percent = 10
        archive.on("data", (chunk) => {
            if (archive.pointer() / totalSize * 100 >= percent) {
                callback({
                    status: "progress",
                    deskripsi : percent})
                percent += 10
            }
        })

        archive.on("end", () => {
            fs.unlink(location + filename, err => {
                if (err) console.log(err)
                
                else {
                    const urlFile = "http://localhost:3001/data/" + filename + ".zip"
                    return callback({
                        status : "completed",
                        deskripsi : urlFile})
                }
            })
        })

        archive.pipe(output)
        archive.append(input, { name: filename })
        archive.finalize()
    }, 2000)
}


amqplib.connect({
    protocol: "amqp",
    hostname: "152.118.148.103",
    port: "5672",
    username: "1506689061",
    password: "375592",
    vhost: "1506689061"
}, (err, conn) => {
    if(err){
        return console.log("ws rusak")
    } else{
        conn.createChannel((err, ch)=>{
            if(err) return console.log("ws rusak")
            channel = ch
            app.listen(3001, () => {
                console.log("Server runnning on port 3000")
            })
        })
    }
    
})
