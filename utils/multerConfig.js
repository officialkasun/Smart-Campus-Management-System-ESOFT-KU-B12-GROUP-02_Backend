// utils/multerConfig.js
import multer from 'multer';
import path from 'path';

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Rename file to avoid conflicts
  },
});

// Initialize upload
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|ppt|pptx|txt/; // Allowed file types
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, PPT, and TXT files are allowed'));
    }
  },
});

export default upload;