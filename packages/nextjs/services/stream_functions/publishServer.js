const express = require('express');
const ethers = require('ethers');
const cors=require('cors');
const app = express();
app.use(express.json());
app.use(cors());
// Endpoint to receive the signed message and verify the signature
app.post('/verify', (req, res) => {
  const { publicAddress, message, signature } = req.body;
 

  // Verify the message signature with the provided public address
  const isVerified = verifySignature(publicAddress, message, signature);

  if (isVerified) {
    res.status(200).json({ verified: true });
  } else {
    res.status(400).json({ verified: false });
  }
});

// Verify the message signature with a public address
function verifySignature(publicAddress, message, signature) {

//   const messageHash = ethers.keccak256(ethers.toUtf8Bytes(message));
  const recoveredAddress = ethers.verifyMessage(message, signature);
  console.log(signature);
  return publicAddress.toLowerCase() === recoveredAddress.toLowerCase();
}

// Start the server
const port = 3500;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
