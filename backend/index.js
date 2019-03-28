const express = require('express')
const amqplib = require('amqplib/callback_api')
const fileupload = require('express-fileupload')
var fs = require('fs');
var archiver = require('archiver');

const location = __dirname + '/data/'


const app = express()
app.use(fileupload())
let channel = null

const handleUpload = (filename, totalSize, callback) =>{
    setTimeout(()=>{
        var archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        var output = fs.createWriteStream(location + filename + ".zip");
        var input = fs.createReadStream(location + filename)
        // output.on('close', ()=>{
        //     callback(archive.pointer())
        // })
        let percent = 10
        archive.on("data", (chunk)=>{
            if(archive.pointer()/totalSize*100 >= percent){
                callback(percent)
                percent += 10
            }
        })

        archive.on("end", ()=>{
            fs.unlink(location + filename, err => {
                if(err) console.log(err)
                else return callback("Data has been compressed")
            })
        })

        archive.pipe(output)
        archive.append(input, {name : filename})
        archive.finalize()
    }, 0)
}



// amqp.connect({
//     protocol: "amqp",
//     hostname: "152.118.148.103",
//     port: 5672,
//     username: "0806444524",
//     password:"0806444524",
//     vhost: "/0806444524",
// }, (err, conn) => {
//     conn.createChannel(function(err, ch) {
//         var ex = 'exchange_ping';
//         var msg = 'Hello World! ini Arief';
    
//         ch.assertExchange(ex, 'fanout', {durable: false});
//         while(true){
//             ch.publish(ex, '', new Buffer(msg));
//             console.log(" [x] Sent %s", msg);
//         }
        
//       });
//     //   setTimeout(function() { conn.close(); process.exit(0) }, 500);
// })

app.post("/upload", (req,res)=>{
    const file = req.files.file
    const filename = file.name
    const totalSize = file.size
    file.mv(location + file.name, err =>{
        if(err){
            return res.status(500).send("ada error")
        }
        handleUpload(filename, totalSize, (response)=>{
            console.log(response)
        })
        res.json({status: "ok"})
    })
})

app.listen(3001, ()=>{
    console.log("Server runnning on port 3000")
})