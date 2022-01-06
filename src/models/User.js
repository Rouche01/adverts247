const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const options = {
  discriminatorKey: "kind",
  toJSON: {
    versionKey: false,
    timestamps: true,
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
    },
  },
};

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  options
);

userSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, (err, hashedPassword) => {
      if (err) {
        return next(err);
      }

      user.password = hashedPassword;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (password) {
  const user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return reject(err);
      }

      if (!isMatch) {
        return reject(false);
      }

      resolve(true);
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User, options };
