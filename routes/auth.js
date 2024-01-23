const express = require("express");

const {
  loginMember,
  logoutMember,
  registerMember,
  resendEmail,
  confirmEmail,
  getCurrentMember,
  forgotPassword,
  resetPassword,
  changePassword
} = require("../controllers/auth");

const router = express.Router({ mergeParams: true });

const { protect } = require("../middleware/auth");
const { logger } = require("../middleware/logger");

router
  .route("/login")
  .post(logger,loginMember); 

router
  .route("/logout")
  .get(logger,logoutMember);   

router
  .route("/register")
  .post(logger, registerMember);

router
  .route("/resend")
  .get(logger, protect, resendEmail); 

router
  .route("/confirmemail")
  .get(logger,confirmEmail);

router
  .route("/getcurrentmember")
  .get(logger,protect, getCurrentMember);

router
  .route("/forgotPassword")
  .post(logger,forgotPassword);

router
  .route("/resetpassword")
  .post(logger,resetPassword);

router
  .route("/changepassword")
  .put(logger,protect, changePassword);

// Example call:
// DEV: localhost:5000/api/v1/auth/login POST {body content}
// PROD: ((domain))/api/v1/auth/login POST {body content}

module.exports = router;
