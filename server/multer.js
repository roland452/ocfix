import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv'
dotenv.config()

// 1. Configure Cloudinary with your credentials 
cloudinary.config({
  cloud_name:'dtfekx2ic',
  api_key:'884738257577951',
  api_secret:'8mVjdTWuLaEJ94sK0R5Io3i0sso'
});

// 2. Setup Cloudinary Storage instead of diskStorage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder based on file type
    let folderName = 'octfix/others';
    if (file.mimetype.startsWith('image/')) folderName = 'octfix/projects';
    else if (file.mimetype === 'application/pdf') folderName = 'octfix/docs';
    
    return {
      folder: folderName,
      public_id: Date.now() + '-' + Math.round(Math.random() * 1E9),
      resource_type: 'auto' // Important for non-image files like PDFs
    };
  },
});

const Upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 
      'application/pdf',                      
      'audio/mpeg', 'audio/wav', 'audio/webm' 
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format'), false);
    }
  }
});

export default Upload;
