const router = require('express').Router();

const BinhLuan = require('../models/binhluan');
const { kiemTraDangNhap } = require('../middleware/auth');

// POST: Đăng bình luận
router.post('/:idBaiViet', kiemTraDangNhap, async (req, res) => {
  await BinhLuan.create({
    noiDung: req.body.noiDung,
    tacGia: req.session.MaNguoiDung,
    baiViet: req.params.idBaiViet
  });
  res.redirect('/news/' + req.params.idBaiViet);
});

// GET: Xóa bình luận
router.get('/:idBinhLuan/xoa', kiemTraDangNhap, async (req, res) => {
  const binhLuan = await BinhLuan.findById(req.params.idBinhLuan);
  await BinhLuan.findByIdAndDelete(req.params.idBinhLuan);
  res.redirect('/news/' + binhLuan.baiViet);
});

module.exports = router;