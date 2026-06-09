import multer from "multer";
import path from "path";
import { randomBytes } from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// 1. Configure Cloudinary credentials (only active when the env keys exist)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Local Disk Storage Setup
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const randomName = randomBytes(8).toString("hex") + ext;
    cb(null, randomName);
  },
});

// 3. Cloudinary Storage Setup
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "sale-board-products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    public_id: (req, file) => {
      const ext = path.extname(file.originalname);
      return randomBytes(8).toString("hex");
    },
  },
});

// 4. Dynamic Selection: Use Cloudinary in production, local disk in dev


const selectedStorage = cloudinaryStorage;

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

export const upload = multer({ storage: selectedStorage, fileFilter });