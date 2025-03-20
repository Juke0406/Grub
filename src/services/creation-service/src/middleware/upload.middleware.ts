import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { config } from "../config";
import { ApiError } from "./error.middleware";
import { logger } from "../utils/logger";

// Ensure upload directory exists
const createUploadDir = () => {
  const uploadDir = config.localStoragePath;
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    logger.info(`Created upload directory: ${uploadDir}`);
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    createUploadDir();
    cb(null, config.localStoragePath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter to allow only images
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
      ) as any
    );
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Middleware for single image upload
export const uploadSingleImage = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadHandler = upload.single(fieldName);

    uploadHandler(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return next(new ApiError(400, "File size exceeds the 5MB limit"));
          }
        }
        return next(err);
      }

      // Add file path to request body if file was uploaded
      if (req.file) {
        req.body.imagePath = req.file.path;
        logger.info(`File uploaded: ${req.file.path}`);
      }

      next();
    });
  };
};

// Middleware for multiple image upload
export const uploadMultipleImages = (
  fieldName: string,
  maxCount: number = 5
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadHandler = upload.array(fieldName, maxCount);

    uploadHandler(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return next(new ApiError(400, "File size exceeds the 5MB limit"));
          }
          if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return next(
              new ApiError(400, `Too many files. Maximum allowed: ${maxCount}`)
            );
          }
        }
        return next(err);
      }

      // Add file paths to request body if files were uploaded
      if (req.files && Array.isArray(req.files)) {
        req.body.imagePaths = (req.files as Express.Multer.File[]).map(
          (file) => file.path
        );
        logger.info(`${req.files.length} files uploaded`);
      }

      next();
    });
  };
};

// Helper function to delete file
export const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.error(`Error deleting file ${filePath}:`, err);
        reject(err);
      } else {
        logger.info(`File deleted: ${filePath}`);
        resolve();
      }
    });
  });
};
