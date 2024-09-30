require('dotenv').config();
const express = require('express');
const Minio = require('minio');

// Application Setup
const app = express();
const port = process.env.APP_PORT;
const host = process.env.APP_HOST;

// Initialize MinIO client
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT, 10),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

// Route to list objects in the bucket
// Redirect from root to /list-objects
app.get('/', (req, res) => {
    res.redirect('/list-objects');
});

app.get('/list-objects', async (req, res) => {
    try {
        const objects = minioClient.listObjects(process.env.MINIO_BUCKET_NAME, '', true);
        const objectList = [];

        // Collect objects into an array
        for await (const obj of objects) {
            objectList.push(obj.name);
        }

        // Send the object list as a JSON response
        res.json({
            bucket: process.env.MINIO_BUCKET_NAME,
            objects: objectList,
        });
    } catch (error) {
        console.error('Error listing objects:', error);
        res.status(500).json({ error: 'Error listing objects' });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
