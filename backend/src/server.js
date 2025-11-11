const express = require('express');
const cors = require('cors');
const { Storage } = require('@google-cloud/storage');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://media-enhancer.vercel.app'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME || 'media-enhancer-vcn-videos';
const bucket = storage.bucket(bucketName);

console.log('Server starting on port', PORT);
console.log('Bucket:', bucketName);

app.options('*', cors());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Media Enhancer Backend' });
});

app.get('/signed-url', async (req, res) => {
  console.log('Signed URL request received');
  try {
    const fileName = 'uploads/' + Date.now() + '-' + req.query.fileName;
    const file = bucket.file(fileName);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 10 * 60 * 1000,
      contentType: req.query.contentType || 'application/octet-stream'
    });

    const publicUrl = 'https://storage.googleapis.com/' + bucketName + '/' + fileName;

    console.log('Signed URL generated for:', fileName);
    res.json({ uploadUrl: url, publicUrl: publicUrl, fileName: fileName });
  } catch (error) {
    console.error('Signed URL error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log('Server listening on port', PORT);
});
