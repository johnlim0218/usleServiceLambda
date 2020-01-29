const AWS = require('aws-sdk');
const Sharp = require('sharp');

const S3 = new AWS.S3 ({ region: 'ap-northeast-2'});

exports.handler = async (event, context, callback) => {
    const Bucket = event.Records[0].s3.bucket.name;
    const Key = decodeURI(event.Records[0].s3.object.key);
    // 이미지 파일의 용도(리뷰 게시판 / 제품 사진 등의 구분을 위해)
    const type = Key.split('/')[Key.split('/').length - 3];
    const filename = Key.split('/')[Key.split('/').length - 1];
    const ext = Key.split('.')[Key.split('.').length - 1];
    const requiredFormat = ext === 'jpg' ? 'jpeg' : ext;

    console.log(event);
    console.log(Bucket);
    console.log(Key);
    console.log(type);
    console.log(filename);

    try {
        // S3 Bucket에 유입된 데이터 가져오기 
        const s3Object = await S3.getObject({
            Bucket,
            Key,
        }).promise();
        console.log('original', s3Object.Body.length);

        // 이미지 리사이징
        const resizedImage = await Sharp(s3Object.Body)
        .resize(800, 800, {
            fit: 'cover'
        })
        .toFormat(requiredFormat)
        .toBuffer();
        console.log('resize', resizedImage.length);

        // 리사이징된 데이터 S3 Bucket에 다시넣기
        await S3.putObject({
            Bucket,
            Key: `${type}/thumb/${filename}`,
            Body: resizedImage,
        }).promise();
        console.log("put");
        return callback(null, `${type}/thumb/${filename}`);
    } catch(e) {
        console.error(e);
        return callback(e);
    }

}