const ErrorResponse = require("../utils/ErrorResponse");
const devLog = require("../utils/devLog");

const errorHandler = (err, req, res, next) => {
  devLog("Middleware Error Hadnling");
  devLog("full Error statck: " + JSON.stringify(err.stack));
  const errStatus = err.statusCode || 500;
  const errMsg = err.message || 'Something went wrong';
  res.status(errStatus).json({
      success: false,
      status: errStatus,
      message: errMsg,
      stack: process.env.NODE_ENV === 'dev' ? err.stack : {}
  })
}

module.exports = errorHandler;
