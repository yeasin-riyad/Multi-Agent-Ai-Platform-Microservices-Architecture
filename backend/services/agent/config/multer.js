import fs from "fs";
import path from "path";
import multer from "multer";

/* ──────────────────────────────────────────────────────────────── */
/*  Upload directory                                              */
/* ──────────────────────────────────────────────────────────────── */

const uploadDir = path.resolve("./temp");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ──────────────────────────────────────────────────────────────── */
/*  Allowed types                                                 */
/* ──────────────────────────────────────────────────────────────── */

const ALLOWED_MIMES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
]);

/* ──────────────────────────────────────────────────────────────── */
/*  Storage                                                       */
/* ──────────────────────────────────────────────────────────────── */

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, safe);
  },
});

/* ──────────────────────────────────────────────────────────────── */
/*  File filter — MIME + extension double check                   */
/* ──────────────────────────────────────────────────────────────── */

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = ALLOWED_MIMES.has(file.mimetype);
  const extOk = ALLOWED_EXTENSIONS.has(ext);

  if (mimeOk && extOk) {
    return cb(null, true);
  }

  const err = new Error(
    "Only PDF and image files (jpg, png, webp, gif) are allowed",
  );
  err.code = "INVALID_FILE_TYPE";
  cb(err, false);
};

/* ──────────────────────────────────────────────────────────────── */
/*  Export multer instance                                        */
/* ──────────────────────────────────────────────────────────────── */

export default multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, 
    files: 1,                   
  },
});