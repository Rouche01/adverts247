const multer = require('multer');
const DatauriParser = require('datauri/parser');

const storage = multer.memoryStorage();
const multerUploads =  multer({ storage }).single('image');

const dUriParser = new DatauriParser();

const dataUri = (req) => {

    const fileNameSplit = req.file.originalname.split('.');
    const fileType = fileNameSplit[fileNameSplit.length - 1];
    return (
        dUriParser.format(`.${fileType}`, req.file.buffer) 
    )
}

module.exports = {multerUploads, dataUri}