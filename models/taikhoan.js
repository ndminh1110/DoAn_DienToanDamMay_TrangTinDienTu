const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const taikhoanSchema = new mongoose.Schema(
  {
    ten: {
      type: String,
      required: [true, 'Tên không được để trống'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email không được để trống'],
      unique: true,
      lowercase: true,//tránh lưu email 2 lần bằng chữ hoa và thường
      trim: true,//xoá khoảng trắng
    },
    matkhau: {
      type: String,
      required: [true, 'Mật khẩu không được để trống'],
      minlength: [6, 'Mật khẩu tối thiểu 6 ký tự'],
    },
    vaitro: {
      type: String,
      enum: ['user', 'admin'],//ds vai trò
      default: 'user',//mặt định
    },
    avatar: { type: String, default: '' }
  },
  { timestamps: true }
 
);

module.exports = mongoose.model('taikhoan', taikhoanSchema);