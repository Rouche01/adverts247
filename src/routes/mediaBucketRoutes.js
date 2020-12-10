const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/requireAuth');
const mongoose = require('mongoose');
const multer = require('multer');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');


const storage = multer.memoryStorage();

const upload = multer({ storage: storage }).single('video');

router.use(requireAuth);


router.get('/mediaBucket/prefix/:bucketName', (req, res) => {
    const bucketID = req.params.bucketName;

    const s3 = new AWS.S3({apiVersion: '2006-03-01'});

    const params = {
        Bucket: bucketID
    };

    s3.listObjects(params, (err, data) => {
        if(err) {
            res.status(500).send({
                error: err.stack
            })
        }
        else {
            const objects = data.Contents;
            const newObj = objects.map(obj => {
                return obj.Key
            });

            let prefixs = [];
            let memoryPrefix;

            for ( let i = 0; i < newObj.length; i++ ) {

                const prefix = newObj[i].split('/')[0];

                if(prefix !== memoryPrefix) {
                    prefixs.push(prefix);
                }

                memoryPrefix = prefix;
            }
            res.status(200).send(prefixs);
        }
    })
});


router.post('/mediaBucket/vod-contents', upload, (req, res) => {

    const { videoLabel } = req.body;
    
    // console.log(req.file);
    const fileName = req.file.originalname.split('.');
    const fileType = fileName[fileName.length - 1];

    const s3 = new AWS.S3({apiVersion: '2006-03-01'});

    const params = {
        Bucket: 'vod-watchfolder-247/inputs',
        Key: `${videoLabel}-${uuidv4()}.${fileType}`,
        Body: req.file.buffer
    }

    s3.upload(params, (err, data) => {

        if(err) {
            res.status(500).send(err.stack);
        }

        res.status(200).send(data);

    })

});



module.exports = router;


