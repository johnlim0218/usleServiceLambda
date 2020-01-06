const AWS = require('aws-sdk');
const Sharp = require('sharp');

const S3 = new AWS.S3 ({ region: 'ap-northeast-2'});

exports.handler = async (event, context, callback) => {
    const Bucket = event.Records[0].s3.bucket.name;
    const Key = event.Records[0].s3.object.key;
    const filename = Key.split('/')[[Key.split('/').length - 1]];
    const ext = Key.split('.')[[Key.split('.').length - 1]];

    const requiredFormat = ext === 'jpg' ? 'jpeg' : ext;

    try {
        // S3 Bucket에 유입된 데이터 가져오기 
        const s3Object = await S3.getObject({
            Bucket,
            Key,
        }).promise();

        // 이미지 리사이징
        const resizedImage = await Sharp(s3Object.Body)
        .resize(800, 800, {
            fit: 'inside'
        })
        .toFormat(requiredFormat)
        .toBuffer();

        // 리사이징된 데이터 S3 Bucket에 다시넣기
        await S3.putObject({
            Bucket,
            key: `thumb/${filename}`,
            Body: resizedImage,
        })
        return callback(null, `thumb/${filename}`);
    } catch(e) {

    }

}