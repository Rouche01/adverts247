const { TriviaSession } = require("../models/TriviaSession");

const deleteTriviaSessions = async (req, res, next) => {
  const { rider_id } = req.params;

  try {
    await TriviaSession.deleteMany({ userId: rider_id });
    next();
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

module.exports = deleteTriviaSessions;
