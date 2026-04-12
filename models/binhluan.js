const mongoose = require('mongoose');

const binhLuanSchema = new mongoose.Schema(
  {
    noiDung: {
      type: String,
      required: [true, 'Nội dung không được để trống'],
      trim: true,
    },
    tacGia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'taikhoan',
      required: true,
    },
    baiViet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('binhluan', binhLuanSchema);