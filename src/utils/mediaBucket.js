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

const deleteFromS3Bucket = (params) => {
  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, data) => {
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

const uploadToMediaBucket = async (label, fileType, bucketName, buffer) => {
  const key = `${label}-${uuidv4()}`;
  const params = {
    Bucket: `${bucketName}/inputs`,
    Key: `${key}.${fileType}`,
    Body: buffer,
  };

  const data = await uploadToS3(params);
  return { data, s3Key: key };
};

const deleteFromMediaBucket = (key, bucketName) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  return deleteFromS3Bucket(params);
};

module.exports = {
  uploadToMediaBucket,
  generateSignedUrl,
  deleteFromMediaBucket,
};
