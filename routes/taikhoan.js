const router = require('express').Router();

const TaiKhoan = require('../models/taikhoan');
const BaiViet = require('../models/baiviet');
const bcrypt = require('bcryptjs');
const { kiemTraDangNhap } = require('../middleware/auth');
const upload = require('../middleware/uploadPic');

// GET: Trang cá nhân
router.get('/', kiemTraDangNhap, async (req, res) => {
  const taikhoan = await TaiKhoan
	.findById(req.session.MaNguoiDung);
	
  const dsBaiViet = await BaiViet
	.find({ tacGia: req.session.MaNguoiDung })
    .sort('-createdAt');
	
  const dsBinhLuan = await require('../models/binhluan')
    .find({ tacGia: req.session.MaNguoiDung })
    .populate('baiViet', 'tieuDe')
    .sort('-createdAt');
	
  res.render('trangcanhan', {
    title: 'Trang ca nhan',
    taikhoan,
    dsBaiViet,
    dsBinhLuan,
    session: req.session,
    theLoai: '',
    timkiem: '',
    hideBanner: true 
  });
});

// POST: Đổi tên
router.post('/doiten', kiemTraDangNhap, async (req, res) => {
  await TaiKhoan.findByIdAndUpdate(req.session.MaNguoiDung, {
    ten: req.body.ten
  });
  req.session.HoVaTen = req.body.ten;
  req.session.success = 'Đổi tên thành công!';
  res.redirect('/taikhoan');
});

// POST: Đổi mật khẩu
router.post('/doimatkhau', kiemTraDangNhap, async (req, res) => {
  const taikhoan = await TaiKhoan.findById(req.session.MaNguoiDung);
  if (!bcrypt.compareSync(req.body.matkhauCu, taikhoan.matkhau)) {
    req.session.error = 'Mật khẩu cũ không đúng!';
    return res.redirect('/taikhoan');
  }
  const salt = bcrypt.genSaltSync(10);
  await TaiKhoan.findByIdAndUpdate(req.session.MaNguoiDung, {
    matkhau: bcrypt.hashSync(req.body.matkhauMoi, salt)
  });
  req.session.success = 'Đổi mật khẩu thành công!';
  res.redirect('/taikhoan');
});


router.post('/avatar', kiemTraDangNhap, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      req.session.error = 'Chưa chọn ảnh!';
      return res.redirect('/taikhoan');
    }

    const avatarPath = req.file.path;

    await TaiKhoan.findByIdAndUpdate(req.session.MaNguoiDung, {
      avatar: avatarPath
    });

    req.session.avatar = avatarPath;

    req.session.success = 'Đổi avatar thành công!';
    res.redirect('/taikhoan');

  } catch (err) {
    console.log(err);
    res.redirect('/taikhoan');
  }
});
module.exports = router;