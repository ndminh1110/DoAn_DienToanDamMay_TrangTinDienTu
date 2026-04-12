// Kiểm tra đã đăng nhập chưa
const kiemTraDangNhap = (req, res, next) => {
  if (req.session.MaNguoiDung) {
    next(); // đã đăng nhập thì cho đi tiếp
  } else {
    req.session.error = 'Bạn cần đăng nhập để thực hiện chức năng này.';
    res.redirect('/auth/dangnhap');
  }
};

// Kiểm tra có phải admin không
const kiemTraAdmin = (req, res, next) => {
  if (req.session.QuyenHan === 'admin') {
    next();
  } else {
    req.session.error = 'Bạn không có quyền truy cập.';
    res.redirect('/');
  }
};

module.exports = { kiemTraDangNhap, kiemTraAdmin };