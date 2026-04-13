require('dotenv').config();

const session = require('express-session');
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const ejsLayouts = require('express-ejs-layouts');
//const translateRouter = require("./routes/translate");

const app = express();

// Kết nối MongoDB
connectDB();

// giao diện dùng ejs để render
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(ejsLayouts);
app.set('layout', 'layout');


// Middleware
// đọc dữ liệu từ html trước
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// lưu đăng nhập
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/Picture', express.static('public/Picture'));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/news', require('./routes/baiviet'));
app.use('/binhluan', require('./routes/binhluan'));
app.use('/taikhoan', require('./routes/taikhoan'));
app.use('/admin', require('./routes/admin'));
app.use('/dich', require('./routes/dich'));

// Trang chủ
app.get('/', (req, res) => {
  res.redirect('/news');
});

// Khởi động server
const PORT = process.env.PORT || 8386;
app.listen(PORT, () => {
  console.log('Server đang chạy tại http://localhost:' + PORT);
});
