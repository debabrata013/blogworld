const { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');

// Create S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    console.log('File received:', file.originalname, file.mimetype);
    
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Function to upload file to S3
const uploadToS3 = async (file) => {
  try {
    const fileName = `blog-images/${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      // Removed ACL - will use bucket policy for public access
    });

    await s3Client.send(command);
    
    // Return the S3 URL
    const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    
    console.log('✅ File uploaded successfully to:', s3Url);
    
    return {
      location: s3Url,
      key: fileName,
      bucket: process.env.AWS_S3_BUCKET_NAME
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

// Function to delete file from S3
const deleteFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key
    });
    
    const result = await s3Client.send(command);
    console.log(`Successfully deleted ${key} from S3`);
    return result;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};

// Function to test S3 connection
const testS3Connection = async () => {
  try {
    const command = new HeadBucketCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME
    });
    
    await s3Client.send(command);
    console.log('✅ S3 connection successful');
    return true;
  } catch (error) {
    console.error('❌ S3 connection failed:', error.message);
    return false;
  }
};

module.exports = {
  upload,
  uploadToS3,
  deleteFromS3,
  testS3Connection,
  s3Client
};
