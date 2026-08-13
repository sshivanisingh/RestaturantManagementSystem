import multer from "multer";
import path   from "path";
import fs     from "fs";
import { ApiError } from "../utils/ApiError.js";

// Auto-create upload directory if it does not exist
const UPLOAD_DIR = "./public/temp";
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Storage config — save file to disk with unique name
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req,  file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext    = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${unique}${ext}`);
  },
});

// Allow only images and PDFs
const fileFilter = (_req, file, cb) => {
  const extAllowed  = /jpeg|jpg|png|gif|webp|avif|pdf/i;
  const extValid    = extAllowed.test(path.extname(file.originalname));
  const mimeValid   = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';

  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only images (jpg, png, webp, gif) and PDF allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max per file
    files:    5,                // max 5 files per request
  },
});