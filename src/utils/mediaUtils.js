const ffmpeg = require("fluent-ffmpeg");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

const generateThumbnail = (file, name) => {
  return new Promise((resolve, reject) => {
    const filename = `${name}-${uuidv4()}-thumbnail`;

    ffmpeg({ source: file })
      .on("end", () => {
        const filePath = `src/uploads/thumbnails/${filename}.png`;
        resolve(filePath);
      })
      .on("error", (error) => {
        console.log(error);
        reject(error);
      })
      .takeScreenshots(
        {
          count: 1,
          filename,
        },
        "src/uploads/thumbnails"
      );
  });
};

const deleteThumbnailFromDisk = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

module.exports = { generateThumbnail, deleteThumbnailFromDisk };
