const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/ErrorResponse");
const devLog = require("../utils/devLog");
const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = require("../middleware/getSequelize");
const Member = require("../models/Member.js")(sequelize, DataTypes);

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // debug
    // devLog("req.headers.authorization is: " + JSON.stringify(req.headers.authorization))
    token = req.headers.authorization.split(" ")[1];
    // debug
    // devLog("token after splitting is: " + JSON.stringify(token))
  } else if (req.cookies.token) {
    // If it can't find the Bearer token it will look for a token in a cookie
    token = req.cookies.token;
    // debug
    // devLog("token after getting cookie is: " + JSON.stringify(token))
  }
  // If no token, respond with an error
  if (!token) {
    return next(new ErrorResponse("No token: Not authorized to acess this route", 401));
  }

  try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // debug
      //devLog("JWT Decoded: " + JSON.stringify(decoded));
      const member = await Member.findOne( { where:
        {id: decoded.id}
      });
      if( member === null){ return next(new ErrorResponse('No member found', 401)); } 
      // attach new variables to the request for use in controller methods
      req.id = decoded.id;
      req.role = member.role; // role ALWAYS comes from db for latest source of truth
      // attach the member to the request for use in controller methods
      req.member = member;
      next();
  } catch (err) {
    return next(new ErrorResponse("Error validating token: Not authorized to access this route", 401));
  }
});

// Grant access to specific roles based on decoded JWT - to - DB query
// If it doesn't find the matching req.role assigned in 'protect', return error response
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
