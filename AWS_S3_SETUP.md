# AWS S3 Setup Guide for Blogify

## Prerequisites
- AWS Account
- AWS CLI installed (optional but recommended)

## Step 1: Create S3 Bucket

1. Go to AWS Console → S3
2. Click "Create bucket"
3. Choose a unique bucket name (e.g., `blogify-images-your-name`)
4. Select your preferred region (e.g., `us-east-1`)
5. **Important**: Uncheck "Block all public access" since we need public read access for images
6. Acknowledge the warning about public access
7. Click "Create bucket"

## Step 2: Configure Bucket Policy

1. Go to your bucket → Permissions tab
2. Scroll to "Bucket policy"
3. Add this policy (replace `YOUR_BUCKET_NAME` with your actual bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}
```

## Step 3: Create IAM User

1. Go to AWS Console → IAM
2. Click "Users" → "Add users"
3. Enter username (e.g., `blogify-s3-user`)
4. Select "Programmatic access"
5. Click "Next: Permissions"
6. Click "Attach existing policies directly"
7. Search and select `AmazonS3FullAccess` (or create custom policy for better security)
8. Click through to create user
9. **Important**: Save the Access Key ID and Secret Access Key

## Step 4: Update Environment Variables

Update your `.env` file with:

```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name-here
```

## Step 5: Test the Setup

1. Start your application: `npm run dev`
2. Try creating a new blog post with an image
3. Check if the image appears correctly
4. Verify the image URL points to your S3 bucket

## Security Best Practices

### Custom IAM Policy (Recommended)
Instead of `AmazonS3FullAccess`, create a custom policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        },
        {
            "Effect": "Allow",
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME"
        }
    ]
}
```

### Environment Variables Security
- Never commit `.env` file to version control
- Use AWS IAM roles in production instead of access keys
- Consider using AWS Secrets Manager for production

## Troubleshooting

### Common Issues:

1. **403 Forbidden Error**: Check bucket policy and IAM permissions
2. **Images not loading**: Verify bucket is public and CORS is configured
3. **Upload fails**: Check file size limits and allowed file types

### CORS Configuration (if needed):
If you face CORS issues, add this to your bucket's CORS configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

## Cost Optimization

- S3 Standard storage: ~$0.023 per GB/month
- PUT requests: ~$0.005 per 1,000 requests
- GET requests: ~$0.0004 per 1,000 requests

For a blog with moderate traffic, monthly costs should be under $5.
