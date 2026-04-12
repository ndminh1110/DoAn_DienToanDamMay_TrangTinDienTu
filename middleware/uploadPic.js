const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  // Lưu ảnh vào public 
  destination: (req, file, cb) => {
    cb(null, 'public/picture');
  },
  // Đặt tên file: thời gian + tên gốc
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
// Chỉ cho phép upload ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb('Chỉ được upload file ảnh!');
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;