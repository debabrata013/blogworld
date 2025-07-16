require('dotenv').config();
const { testS3Connection } = require('./services/s3Service');

async function testS3() {
  console.log('🔍 Testing S3 Configuration...');
  console.log('Bucket:', process.env.AWS_S3_BUCKET_NAME);
  console.log('Region:', process.env.AWS_REGION);
  console.log('Access Key ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing');
  console.log('Secret Access Key:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing');
  
  console.log('\n🚀 Testing S3 connection...');
  
  try {
    const result = await testS3Connection();
    if (result) {
      console.log('🎉 S3 setup is working perfectly!');
      console.log('You can now upload images to your blog.');
    } else {
      console.log('❌ S3 connection failed. Please check your credentials and bucket name.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testS3();
