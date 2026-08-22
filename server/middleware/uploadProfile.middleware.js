const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(__dirname, "../uploads/profile");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {

        const ext = path.extname(file.originalname);

        cb(
            null,
            `profile-${req.user.id}-${Date.now()}${ext}`
        );

    }

});

const fileFilter = (req, file, cb) => {

    const allowed = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp"
    ];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed."));
    }

};

module.exports = multer({

    storage,
    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});