const router = require('express').Router();
const bcrypt = require('bcryptjs');
const TaiKhoan = require('../models/taikhoan');

// GET đăng ký
router.get('/dangky', async (req, res) => {
  res.render('dangky', { title: 'Đăng ký tài khoản', session: req.session, theLoai: '', timkiem: '' });
});

// POST đăng ký
router.post('/dangky', async (req, res) => {
  const salt = bcrypt.genSaltSync(10);
  const data = {
    ten: req.body.ten,
    email: req.body.email,
    matkhau: bcrypt.hashSync(req.body.matkhau, salt),
    vaitro: 'user'
  };
  await TaiKhoan.create(data);
  req.session.success = 'Đăng ký tài khoản thành công!';
  res.redirect('/news');
});

// GET đăng nhập
router.get('/dangnhap', async (req, res) => {
  res.render('dangnhap', { title: 'Đăng nhập', session: req.session, theLoai: '', timkiem: '' });
});

// POST đăng nhập
router.post('/dangnhap', async (req, res) => {
  if (req.session.MaNguoiDung) {
    req.session.error = 'Bạn đã đăng nhập rồi.';
	res.redirect('/news');
  } else {
    const taikhoan = await TaiKhoan.findOne({ email: req.body.email });
    if (taikhoan) {
      if (bcrypt.compareSync(req.body.matkhau, taikhoan.matkhau)) {
        req.session.MaNguoiDung = taikhoan._id;
        req.session.HoVaTen = taikhoan.ten;
        req.session.QuyenHan = taikhoan.vaitro;
        req.session.avatar = taikhoan.avatar || ''; 
        req.session.success = 'Đăng nhập thành công! Chào ' + taikhoan.ten;
		res.redirect('/news');
      } else {
        req.session.error = 'Mật khẩu không đúng.';
        res.redirect('/auth/dangnhap');
      }
    } else {
      req.session.error = 'Email không tồn tại.';
      res.redirect('/auth/dangnhap');
    }
  }
});

// GET Đăng xuất
router.get('/dangxuat', async (req, res) => {
  if (req.session.MaNguoiDung) {
    delete req.session.MaNguoiDung;
    delete req.session.HoVaTen;
    delete req.session.QuyenHan;
    delete req.session.avatar; // 👈 THÊM
    req.session.success = 'Đã đăng xuất!';
	res.redirect('/news');
  } else {
    req.session.error = 'Bạn chưa đăng nhập.';
    res.redirect('/auth/dangnhap');
  }
});

module.exports = router;