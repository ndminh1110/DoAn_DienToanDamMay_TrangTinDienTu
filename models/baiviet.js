const mongoose = require('mongoose');

const baiVietSchema = new mongoose.Schema(
  {
    tieuDe: {
      type: String,
      required: [true, 'Tiêu đề không được để trống'],
      trim: true,
    },
    noiDung: {
      type: String,
      required: [true, 'Nội dung không được để trống'],
    },
    tacGia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'taikhoan',
      required: true,
    },
    anhMinhHoa: {
      type: [String],
      default: '',
    },
    theLoai: {
      type: String,
      enum: ['Nghệ sĩ', 'Âm nhạc', 'Show', 'Album', 'Phim', 'Thể thao', 'Khác'],
      default: 'Khác',
    },
    luotXem: {
      type: Number,
      default: 0,
    },
    luotThich: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'taikhoan',
      default: []
    },
    moTa: {
      type: String,
      default: ''
    },

    trangThai: {
      type: String,
      enum: ['choDuyet', 'daDuyet', 'tuChoi'],
      default: 'choDuyet',
    },
    lyDoTuChoi: {
      type: String,
      default: ''
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Article', baiVietSchema);