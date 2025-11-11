const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Organize files by type
    let folder = 'others';
    
    if (file.fieldname === 'profilePicture') {
      folder = 'profiles';
    } else if (file.fieldname === 'confidentialFile') {
      folder = 'confidential';
    } else if (file.fieldname === 'medicalDocument') {
      folder = 'medical';
    }
    
    const destPath = path.join(uploadDir, folder);
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    
    cb(null, destPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    profilePicture: /jpeg|jpg|png|gif/,
    confidentialFile: /pdf|doc|docx|txt|jpeg|jpg|png/,
    medicalDocument: /pdf|doc|docx|jpeg|jpg|png/
  };
  
  const fieldname = file.fieldname;
  const extname = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mimetype = file.mimetype;
  
  // Check if field has specific allowed types
  if (allowedTypes[fieldname]) {
    const regex = allowedTypes[fieldname];
    const isValid = regex.test(extname) && regex.test(mimetype.split('/')[1]);
    
    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${fieldname}. Allowed: ${regex}`), false);
    }
  } else {
    // Default: allow common document and image types
    const defaultAllowed = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const isValid = defaultAllowed.test(extname);
    
    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  }
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);
    
    singleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Middleware for multiple file upload
const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxCount);
    
    multipleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Delete file helper
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  deleteFile
};
