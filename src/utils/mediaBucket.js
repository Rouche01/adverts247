const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
});

const uploadToS3 = (params) => {
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) reject(err);
      return resolve(data);
    });
  });
};

const generateSignedUrl = (bucketName, key) => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Expires: 60 * 5,
  };

  s3.config.endpoint = "s3-us-east-2.amazonaws.com";
  s3.config.signatureVersion = "v4";
  s3.config.region = "us-east-2";

  return s3.getSignedUrl("getObject", params);
};

const uploadToMediaBucket = (label, fileType, bucketName, buffer) => {
  const key = `${label}-${uuidv4()}.${fileType}`;
  const params = {
    Bucket: `${bucketName}/inputs`,
    Key: key,
    Body: buffer,
  };

  console.log(key);
  return uploadToS3(params);
};

module.exports = { uploadToMediaBucket, generateSignedUrl };
