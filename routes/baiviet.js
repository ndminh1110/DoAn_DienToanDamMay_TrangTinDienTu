const router = require('express').Router();
const BaiViet = require('../models/baiviet');
const upload = require('../middleware/uploadPic');
const { kiemTraDangNhap, kiemTraAdmin } = require('../middleware/auth');


// GET: Danh sách bài viết
router.get('/', async (req, res) => {
  const theLoai = req.query.theLoai || '';
  const timkiem = req.query.timkiem || '';
  const trang = parseInt(req.query.trang) || 1;
  const soTrangMoiTrang = 9;

  // Chỉ lấy bài đã duyệt cho trang công khai
  const query = { trangThai: 'daDuyet' };
  if (theLoai) query.theLoai = theLoai;
  if (timkiem) query.tieuDe = { $regex: timkiem, $options: 'i' };

  const tongSoBai = await BaiViet.countDocuments(query);
  const tongSoTrang = Math.ceil(tongSoBai / soTrangMoiTrang);

  const dsBaiViet = await BaiViet.find(query)
    .populate('tacGia', 'ten')
    .sort('-createdAt')
    .skip((trang - 1) * soTrangMoiTrang)
    .limit(soTrangMoiTrang);

  const tatCaBaiViet = await BaiViet.find({ trangThai: 'daDuyet' })
    .populate('tacGia', 'ten')
    .sort('-createdAt');

  delete req.session.success;
  delete req.session.error;

  if (theLoai || timkiem) {
    return res.render('danhsach', {
      title: theLoai || 'Tìm kiếm',
      dsBaiViet,
      tatCaBaiViet,
      session: req.session,
      theLoai,
      timkiem,
      trangHienTai: trang,
      tongSoTrang
    });
  }

  res.render('index', {
    title: 'Trang chủ',
    dsBaiViet,
    tatCaBaiViet,
    session: req.session,
    theLoai,
    timkiem,
    trangHienTai: trang,
    tongSoTrang
  });
});


// GET: Form tạo bài mới
router.get('/tao', kiemTraDangNhap, (req, res) => {
  res.render('taobaiviet', { title: 'Tạo bài viết', session: req.session, theLoai: '', timkiem: '' });
});

// POST: Xử lý tạo bài — tự động set choDuyet
router.post('/tao', kiemTraDangNhap, upload.array('anhMinhHoa'), async (req, res) => {
  const data = {
    tieuDe: req.body.tieuDe,
    moTa: req.body.moTa,
    noiDung: req.body.noiDung,
    theLoai: req.body.theLoai,
    anhMinhHoa: req.files ? req.files.map(f => f.path) : [],
    tacGia: req.session.MaNguoiDung,
    trangThai: 'choDuyet', // luôn chờ duyệt khi mới tạo
  };

  await BaiViet.create(data);
  req.session.success = 'Bài viết đã được gửi, chờ admin duyệt!';
  res.redirect('/news');
});


// GET: Chi tiết bài viết
router.get('/:id', async (req, res) => {
  const baiViet = await BaiViet.findByIdAndUpdate(
    req.params.id,
    { $inc: { luotXem: 1 } },
    { returnDocument: 'after' }
  ).populate('tacGia', 'ten');

  if (!baiViet) {
    req.session.error = 'Bài viết không tồn tại.';
    return res.redirect('/news');
  }

  // Chặn xem bài chưa duyệt (trừ tác giả và admin)
  const laTacGia = req.session.MaNguoiDung && baiViet.tacGia._id.toString() === req.session.MaNguoiDung.toString();
  const laAdmin = req.session.QuyenHan === 'admin';

  if (baiViet.trangThai !== 'daDuyet' && !laTacGia && !laAdmin) {
    req.session.error = 'Bài viết này chưa được duyệt.';
    return res.redirect('/news');
  }

  const dsBinhLuan = await require('../models/binhluan')
    .find({ baiViet: req.params.id })
    .populate('tacGia', 'ten')
    .sort('createdAt');

  res.render('chitiet', {
    title: baiViet.tieuDe,
    baiViet,
    dsBinhLuan,
    session: req.session,
    theLoai: '',
    timkiem: ''
  });
});


// GET: Form sửa bài — chỉ tác giả
router.get('/:id/sua', kiemTraDangNhap, async (req, res) => {
  const baiViet = await BaiViet.findById(req.params.id);

  if (!baiViet) return res.redirect('/news');

  if (baiViet.tacGia.toString() !== req.session.MaNguoiDung.toString()) {
    req.session.error = 'Bạn không có quyền sửa bài này.';
    return res.redirect('/news/' + req.params.id);
  }

  res.render('suabai', { title: 'Sửa bài viết', baiViet, session: req.session, theLoai: '', timkiem: '' });
});

// POST: Xử lý sửa bài — chỉ tác giả, sửa xong reset về choDuyet
router.post('/:id/sua', kiemTraDangNhap, upload.array('anhMinhHoa', 10), async (req, res) => {
  const baiViet = await BaiViet.findById(req.params.id);

  if (!baiViet) return res.redirect('/news');

  if (baiViet.tacGia.toString() !== req.session.MaNguoiDung.toString()) {
    req.session.error = 'Bạn không có quyền sửa bài này.';
    return res.redirect('/news/' + req.params.id);
  }

  const anhMoi = req.files && req.files.length > 0
    ? req.files.map(f => f.path)
    : baiViet.anhMinhHoa;

  await BaiViet.findByIdAndUpdate(req.params.id, {
    tieuDe: req.body.tieuDe,
    moTa: req.body.moTa,
    noiDung: req.body.noiDung,
    theLoai: req.body.theLoai,
    anhMinhHoa: anhMoi,
    trangThai: 'choDuyet', // sửa bài thì cần duyệt lại
    lyDoTuChoi: ''
  });

  req.session.success = 'Bài viết đã được cập nhật, chờ admin duyệt lại!';
  res.redirect('/news/' + req.params.id);
});


// GET: Xóa bài — chỉ tác giả hoặc admin
router.get('/:id/xoa', kiemTraDangNhap, async (req, res) => {
  const baiViet = await BaiViet.findById(req.params.id);

  if (!baiViet) return res.redirect('/news');

  const laTacGia = baiViet.tacGia.toString() === req.session.MaNguoiDung.toString();
  const laAdmin = req.session.QuyenHan === 'admin';

  if (!laTacGia && !laAdmin) {
    req.session.error = 'Bạn không có quyền xoá bài này.';
    return res.redirect('/news/' + req.params.id);
  }

  await BaiViet.findByIdAndDelete(req.params.id);
  req.session.success = 'Đã xoá bài viết.';
  res.redirect('/news');
});


// POST: Like/Unlike bài viết
router.post('/:id/like', kiemTraDangNhap, async (req, res) => {
  const baiViet = await BaiViet.findById(req.params.id);
  const daDaLike = baiViet.luotThich.includes(req.session.MaNguoiDung);

  if (daDaLike) {
    await BaiViet.findByIdAndUpdate(req.params.id, {
      $pull: { luotThich: req.session.MaNguoiDung }
    });
  } else {
    await BaiViet.findByIdAndUpdate(req.params.id, {
      $push: { luotThich: req.session.MaNguoiDung }
    });
  }
  res.redirect('/news/' + req.params.id);
});


module.exports = router;