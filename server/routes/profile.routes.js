const express = require("express");

const router = express.Router();

const {
    getProfile,
    updateUserProfile,
    uploadProfileImage
} = require("../controllers/profile.controller");
const upload = require("../middleware/uploadProfile.middleware");

const authMiddleware = require("../middleware/auth.middleware");

router.get("/", authMiddleware, getProfile);

router.put("/", authMiddleware, updateUserProfile);

router.post(
    "/upload-image",
    authMiddleware,
    upload.single("image"),
    uploadProfileImage
);


module.exports = router;