const { Router } = require("express");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const { upload, uploadToS3, testS3Connection } = require("../services/s3ServiceAlternative");

const router = Router();

router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({ blogId: req.params.id }).populate(
      "createdBy"
    );

    return res.render("blog", {
      user: req.user,
      blog,
      comments,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return res.status(500).send("Error loading blog post");
  }
});

router.post("/comment/:blogId", async (req, res) => {
  try {
    // Check if comment content is provided and not empty
    if (!req.body.content || req.body.content.trim() === '') {
      return res.redirect(`/blog/${req.params.blogId}`);
    }
    
    await Comment.create({
      content: req.body.content.trim(),
      blogId: req.params.blogId,
      createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.redirect(`/blog/${req.params.blogId}`);
  }
});

// Alternative upload route using direct S3 upload
router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    console.log("📝 Creating new blog post...");
    
    const { title, body } = req.body;
    
    // Check if required fields are provided
    if (!title || !body) {
      return res.status(400).send("Title and body are required");
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).send("Cover image is required");
    }
    
    console.log("📤 Uploading to S3...");
    
    // Upload file to S3
    const s3Result = await uploadToS3(req.file);
    
    console.log("✅ File uploaded to S3:", s3Result.location);
    
    const blog = await Blog.create({
      body,
      title,
      createdBy: req.user._id,
      coverImageURL: s3Result.location, // S3 URL
    });
    
    console.log("✅ Blog created successfully:", blog._id);
    return res.redirect(`/blog/${blog._id}`);
    
  } catch (error) {
    console.error("❌ Error creating blog:", error);
    
    // Handle multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).send("File size too large. Maximum 5MB allowed.");
    }
    
    if (error.message === 'Only image files are allowed!') {
      return res.status(400).send("Only image files are allowed!");
    }
    
    return res.status(500).send("Error creating blog post: " + error.message);
  }
});

// Test route for S3 connection
router.get("/test/s3", async (req, res) => {
  try {
    const isConnected = await testS3Connection();
    res.json({
      success: isConnected,
      message: isConnected ? "S3 connection successful" : "S3 connection failed",
      bucket: process.env.AWS_S3_BUCKET_NAME,
      region: process.env.AWS_REGION
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error testing S3 connection",
      error: error.message
    });
  }
});

module.exports = router;
