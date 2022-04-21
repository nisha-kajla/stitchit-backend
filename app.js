var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
const db = require('./models');
const { extractor } = require('./middlewares');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const categoryRouter = require('./routes/category');

var cors = require('cors')

var app = express();

app.use(cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(extractor.sortAndPagination);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/category', categoryRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

// admin
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsInR5cGUiOiJBZG1pbiIsImlhdCI6MTY0OTg1NTIyNH0.Xz-V4flqLQNEtEy9MoSBAv8qHG7bbLxRwzBpxjHVQ7w

// tailor
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsInR5cGUiOiJTZXJ2aWNlUHJvdmlkZXIiLCJpYXQiOjE2NDk4NTc1Nzl9.db1kjBxdRbv6uZflI5pZsEvMoeyl7Cy-OyBKiF7iuGw
