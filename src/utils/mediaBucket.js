const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const uploadToS3 = (params) => {
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) reject(err);
      return resolve(data);
    });
  });
};

const uploadToMediaBucket = (label, fileType, bucketName, buffer) => {
  const params = {
    Bucket: `${bucketName}/inputs`,
    Key: `${label}-${uuidv4()}.${fileType}`,
    Body: buffer,
  };

  return uploadToS3(params);
};

module.exports = { uploadToMediaBucket };
