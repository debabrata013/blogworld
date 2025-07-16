require('dotenv').config();

const bucketName = process.env.AWS_S3_BUCKET_NAME;
const region = process.env.AWS_REGION;

console.log('🔧 S3 Bucket Configuration Fix\n');

console.log('Your bucket:', bucketName);
console.log('Region:', region);

console.log('\n📋 To fix the ACL issue, you need to set up a bucket policy for public read access.');
console.log('Here are the AWS CLI commands to run:\n');

console.log('1️⃣ First, make sure your bucket allows public access:');
console.log(`aws s3api put-public-access-block --bucket ${bucketName} --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"`);

console.log('\n2️⃣ Then, set the bucket policy for public read access:');

const bucketPolicy = {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": `arn:aws:s3:::${bucketName}/*`
    }
  ]
};

console.log(`aws s3api put-bucket-policy --bucket ${bucketName} --policy '${JSON.stringify(bucketPolicy)}'`);

console.log('\n🌐 Alternative: Manual Setup via AWS Console:');
console.log('1. Go to AWS S3 Console');
console.log('2. Select your bucket:', bucketName);
console.log('3. Go to "Permissions" tab');
console.log('4. Edit "Block public access" - Uncheck all boxes');
console.log('5. Add this bucket policy in "Bucket policy" section:');
console.log('\n' + JSON.stringify(bucketPolicy, null, 2));

console.log('\n✅ After setting up the bucket policy, your images will be publicly accessible!');
console.log('🔄 Then restart your application and try uploading again.');

// Test current setup
console.log('\n🧪 Testing current upload (without public access):');
console.log('The file will upload but may not be publicly accessible until you set the bucket policy.');
