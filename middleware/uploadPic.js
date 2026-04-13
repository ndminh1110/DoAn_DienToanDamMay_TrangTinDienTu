const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'trangtindientu',
	allowed_formats: [
	  'jpeg', 'jpg', 'png', 'gif', 'webp', 
	  'jfif', 'avif', 'bmp', 'svg', 
	  'tiff', 'tif', 'ico', 'jp2', 'j2k'
	],    
	transformation: [{ width: 800, crop: 'limit' }]
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb('Chỉ được upload file ảnh!');
  }
};	

const upload = multer({ storage, fileFilter });
module.exports = upload;