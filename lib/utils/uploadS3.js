"use strict";

const aws = require('aws-sdk');
const formidable = require('formidable');
const fs = require('fs');
const {
  encode
} = require('js-base64');
const configs = require('../../configs');
const S3_BUCKET_NAME = configs.s3.S3_BUCKET_NAME;
const AWS_ACCESS_KEY_ID = configs.s3.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = configs.s3.AWS_SECRET_ACCESS_KEY;
const s3 = new aws.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY
});
module.exports = function uploadS3(req) {
  //uploadS3 함수를 모듈로 내보냄
  const form = formidable(); //formidable 모듈을 사용하여 form 객체 생성
  return new Promise((resolve, reject) => {
    //Promise 객체 생성
    form.parse(req, (err, fields, files) => {
      //form 객체를 사용하여 req를 파싱
      if (err) {
        //에러 발생 시
        console.error(err); //에러 로그 출력
        reject(err); //Promise를 거부
        return; //함수 종료
      }

      const file = files['file']; //파일 객체 생성
      // const encodedNames = encodeURIComponent(
      // 	`${req.user.userName}/${file.originalFilename}`,
      // );
      const encodedNames = encodeURIComponent(`${file.originalFilename}`);
      const s3Key = `uploads/${encodedNames}`; //S3 버킷에 저장될 파일 경로 생성
      const fileStream = file ? fs.createReadStream(file.filepath) : null; //파일 스트림 생성
      const params = {
        //S3 업로드에 필요한 파라미터 생성
        Bucket: S3_BUCKET_NAME,
        //S3 버킷 이름
        Key: s3Key,
        //파일 경로
        Body: fileStream,
        //파일 스트림
        ContentType: 'application/pdf',
        //파일 타입
        ACL: 'public-read' //파일 접근 권한
      };

      console.log('s3 upload params: ', params);
      try {
        //예외 처리
        //파일 업로드
        s3.upload(params, (err, result) => {
          //S3에 파일 업로드
          if (err) {
            //에러 발생 시
            reject(err); //Promise를 거부
          }

          const fileUrl = result.Location; //업로드된 파일의 URL 생성
          resolve({
            fileUrl,
            fields
          }); //Promise를 이행하고 결과 반환
        });
      } catch (error) {
        //예외 발생 시
        console.error(error); //에러 로그 출력
        reject(error); //Promise를 거부
      }
    });
  });
};