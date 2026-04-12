const router = require('express').Router();
const BaiViet = require('../models/baiviet');
const TaiKhoan = require('../models/taikhoan');
const { kiemTraDangNhap, kiemTraAdmin } = require('../middleware/auth');

router.use(kiemTraDangNhap, kiemTraAdmin);

router.get('/', async (req, res) => {
  const tongBaiViet  = await BaiViet.countDocuments();
  const choDuyet     = await BaiViet.countDocuments({ trangThai: 'choDuyet' });
  const daDuyet      = await BaiViet.countDocuments({ trangThai: 'daDuyet' });
  const tuChoi       = await BaiViet.countDocuments({ trangThai: 'tuChoi' });
  const tongNguoiDung = await TaiKhoan.countDocuments({ vaitro: 'user' });

  res.render('admin/index', {
    title: 'Quản trị',
    session: req.session,
    theLoai: '', timkiem: '',
    tongBaiViet, choDuyet, daDuyet, tuChoi, tongNguoiDung
  });
});

// GET: Danh sách tất cả bài viết (lọc theo trạng thái)
router.get('/baiviet', async (req, res) => {
  const trangThai = req.query.trangThai || '';
  const query = trangThai ? { trangThai } : {};

  const dsBaiViet = await BaiViet.find(query)
    .populate('tacGia', 'ten email')
    .sort('-createdAt');

  res.render('admin/baiviet', {
    title: 'Quản lý bài viết',
    session: req.session,
    theLoai: '', timkiem: '',
    dsBaiViet,
    trangThaiLoc: trangThai
  });
});

// POST: Duyệt bài
router.post('/baiviet/:id/duyet', async (req, res) => {
  await BaiViet.findByIdAndUpdate(req.params.id, {
    trangThai: 'daDuyet',
    lyDoTuChoi: ''
  });
  req.session.success = 'Đã duyệt bài viết!';
  res.redirect('/admin/baiviet?trangThai=choDuyet');
});

// POST: Từ chối bài
router.post('/baiviet/:id/tuchoi', async (req, res) => {
  await BaiViet.findByIdAndUpdate(req.params.id, {
    trangThai: 'tuChoi',
    lyDoTuChoi: req.body.lyDo || 'Không đạt yêu cầu'
  });
  req.session.success = 'Đã từ chối bài viết!';
  res.redirect('/admin/baiviet?trangThai=choDuyet');
});

// POST: Xoá bài
router.post('/baiviet/:id/xoa', async (req, res) => {
  await BaiViet.findByIdAndDelete(req.params.id);
  req.session.success = 'Đã xoá bài viết!';
  res.redirect('/admin/baiviet');
});

// GET: Danh sách người dùng
router.get('/nguoidung', async (req, res) => {
  const dsNguoiDung = await TaiKhoan.find().sort('-createdAt');

  res.render('admin/nguoidung', {
    title: 'Quản lý người dùng',
    session: req.session,
    theLoai: '', timkiem: '',
    dsNguoiDung
  });
});

// POST: Đổi vai trò user <-> admin
router.post('/nguoidung/:id/doivaitro', async (req, res) => {
  const taikhoan = await TaiKhoan.findById(req.params.id);

  // Không cho tự đổi vai trò của chính mình
  if (taikhoan._id.toString() === req.session.MaNguoiDung.toString()) {
    req.session.error = 'Không thể đổi vai trò của chính mình!';
    return res.redirect('/admin/nguoidung');
  }

  const vaitroMoi = taikhoan.vaitro === 'admin' ? 'user' : 'admin';
  await TaiKhoan.findByIdAndUpdate(req.params.id, { vaitro: vaitroMoi });

  req.session.success = `Đã đổi vai trò thành ${vaitroMoi}!`;
  res.redirect('/admin/nguoidung');
});

// POST: Xoá người dùng
router.post('/nguoidung/:id/xoa', async (req, res) => {
  if (req.params.id === req.session.MaNguoiDung.toString()) {
    req.session.error = 'Không thể xoá tài khoản của chính mình!';
    return res.redirect('/admin/nguoidung');
  }

  await TaiKhoan.findByIdAndDelete(req.params.id);
  req.session.success = 'Đã xoá người dùng!';
  res.redirect('/admin/nguoidung');
});


module.exports = router;