// @desc    Logs requests to console
const asyncHandler = require("./async");

exports.logger = asyncHandler(async (req, res, next) => {
  if (process.env.VERBOSE_LOGGING === "true")  
      {
        console.log(
          `${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`
        );
      }
  next();
} )

 /* 
const logger = (req, res, next) => {
  console.log(
    `${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`
  );
  next();
};

module.exports = logger;

*/