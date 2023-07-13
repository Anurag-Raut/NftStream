const express = require('express');
const app = express();
const multer = require('multer');
const busboy = require('connect-busboy');
const cors=require('cors');
const port = 4000;
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const {HLSconversion} = require('../JobQueue/queue')
const { Web3Storage  ,getFilesFromPath ,File } = require('web3.storage');
app.use(cors());


app.use(busboy());




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });

  const upload = multer({ storage: storage });
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.post('/upload', (req, res) => {
  const file = req.busboy;

  // Listen for file events
  file.on('file', (fieldname, fileStream, filename, encoding, mimetype) => {
    // Specify the path to save the uploaded file
    console.log(filename.filename);
    const saveTo = `uploads/${filename.filename}`;

    // Create a write stream to save the file
    const writeStream = fs.createWriteStream(saveTo);

    // Pipe the file stream to the write stream
    fileStream.pipe(writeStream);

    // Handle the completion of the file upload
    writeStream.on('finish', () => {
      console.log('File uploaded successfully');
      // Perform additional processing as needed
    });
  });

  // Listen for finish event when all files are uploaded
  file.on('finish', () => {
    res.status(200).send('All files uploaded successfully');
  });

  // Pipe the incoming request stream to Busboy
  req.pipe(req.busboy);
});

app.use(express.static('./output/anurag'));

// Serve the HLS manifest file
app.get('/stream', (req, res) => {
  const hlsManifestPath = './output/anurag/anurag.m3u8'; // Replace with the path to your HLS manifest file

  res.sendFile(path.join(__dirname, hlsManifestPath));
});



app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

