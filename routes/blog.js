const { Router } = require("express");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const { upload } = require("../services/s3Service");

const router = Router();

router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );

  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

router.post("/comment/:blogId", async (req, res) => {
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
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    const { title, body } = req.body;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).send("Cover image is required");
    }
    
    const blog = await Blog.create({
      body,
      title,
      createdBy: req.user._id,
      coverImageURL: req.file.location, // S3 URL
    });
    
    return res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).send("Error creating blog post");
  }
});

module.exports = router;
