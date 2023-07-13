const express = require('express');
const app = express();
const multer = require('multer');
const cors=require('cors');
const port = 4000;
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const {HLSconversion} = require('../JobQueue/queue')
const { Web3Storage  ,getFilesFromPath ,File } = require('web3.storage');
app.use(cors());






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
app.post('/upload', upload.single('video'),cors(),  (req, res) => {
    if (!req.file) {
      return res.status(400).send('No video file provided');
    }
    
    console.log('done');
    const inputFilePath = `uploads/${req.file.originalname}`;
    
    const outputDirectory = path.parse(req.file.originalname).name;
    // const outputDirectory=req.file.originalname
    const outputFilePath = `output/${outputDirectory}/${outputDirectory}.m3u8`;
    if(!fs.existsSync('./output/'+outputDirectory)){
       fs.mkdirSync('./output/'+outputDirectory, { recursive: true })
      };
    console.log(inputFilePath,outputFilePath)
    // HlsConversion(inputFilePath,outputFilePath)
    HLSconversion('HLS',inputFilePath,outputFilePath,outputDirectory);
   


  
    res.status(200).send('Video file uploaded successfully');
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

