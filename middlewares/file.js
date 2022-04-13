const multer  = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/')
    },
    filename: function (req, file, cb) {
      cb(null, (file.fieldname + file.originalname).replace(/ /ig,''))
    }
  })

const upload = multer({ storage });

module.exports = {
    upload
};