import multer from "multer";
import crypto from "crypto";
import path from "path";
import fs from "fs";

// Create directories if they don't exist
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("avatars")) fs.mkdirSync("avatars");
if (!fs.existsSync("uploads/books")) fs.mkdirSync("uploads/books", { recursive: true });
if (!fs.existsSync("uploads/covers")) fs.mkdirSync("uploads/covers", { recursive: true });

/* ---------- Course Upload Config ---------- */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.pdf', '.docx', '.doc'];
    const safeExt = allowedExtensions.includes(ext) ? ext : '.pdf';
    const uniqueName = crypto.randomUUID() + safeExt;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Type de fichier non autorisé. PDF ou DOCX uniquement."), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

/* ---------- Book Upload Config ---------- */
const BOOK_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB for books
const BOOK_ALLOWED_MIMES = [
  "application/pdf",
  "application/epub+zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "application/x-mobipocket-ebook",
];

const bookStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/books/");
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.pdf', '.epub', '.docx', '.doc', '.txt', '.mobi', '.azw', '.azw3'];
    const safeExt = allowedExtensions.includes(ext) ? ext : '.pdf';
    const uniqueName = crypto.randomUUID() + safeExt;
    cb(null, uniqueName);
  },
});

const bookFileFilter = (req, file, cb) => {
  if (BOOK_ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format non autorisé. PDF, EPUB, DOCX ou TXT uniquement."), false);
  }
};

export const bookUpload = multer({
  storage: bookStorage,
  fileFilter: bookFileFilter,
  limits: {
    fileSize: BOOK_MAX_FILE_SIZE,
    files: 1,
  },
});

/* ---------- Book Cover Upload Config ---------- */
const coverStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/covers/");
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const safeExt = allowedExtensions.includes(ext) ? ext : '.jpg';
    const uniqueName = crypto.randomUUID() + safeExt;
    cb(null, uniqueName);
  },
});

const coverFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format d'image non autorisé. JPEG, PNG ou WebP uniquement."), false);
  }
};

export const coverUpload = multer({
  storage: coverStorage,
  fileFilter: coverFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
});
