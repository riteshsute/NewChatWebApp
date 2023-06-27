
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();



const BUCKET_NAME = 'chatappprojectfiles';
const IAM_USER_KEY = 'AKIA5ZRJAIWVMDKHOGPT';
const IAM_USER_SECRET = '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';

// Initialize AWS SDK
AWS.config.update({
  accessKeyId: IAM_USER_KEY,
  secretAccessKey: IAM_USER_SECRET
});

const s3 = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET
})

const uploadFileToS3 = (fileData, fileName) => {
    console.log(fileData, fileName, 'in s3 config')
    return new Promise((resolve, reject) => {
        const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: fileData,
        ACL: 'public-read'
        };

        

    s3.upload(params, (err, data) => {
      if (err) {
        console.log(err, 'kbddgdkhd')
        reject(err);
      } else {
        console.log( 'successs yeh')
        resolve(data.Location);
      }
    });
  });
};


module.exports = {
    uploadFileToS3
}