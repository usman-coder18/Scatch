const multer = require('multer');
const storage =multer.memoryStorage()

const upload = multer({
    storage:storage
})

module.exports = upload; // Export the upload middleware for use in routes or controllers.
