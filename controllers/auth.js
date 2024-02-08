const ErrorResponse = require("../utils/ErrorResponse");
const devLog = require("../utils/devLog");
const asyncHandler = require("../middleware/async");
const { Sequelize, Model } = require('sequelize');
const db = require("../models");
var jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail'); 

  //  @desc   Allow member to request a password reset link 
  //  @route  POST /api/v1/auth/forgotpassword
  //  @access Public
  exports.forgotPassword = asyncHandler(async (req, res, next) => {
    
          devLog(" forgotPassword "); 
          devLog(" req.body.email: " + JSON.stringify(req.body.email)); 

          memberEmail = req.body.email; 

          // Get member from db
          const member = await db.members.findOne({ where: { email: memberEmail }, });
          if( member === null){ return next(new ErrorResponse('Invalid credentials', 401)); } 
            
          // check for restricted entry for that email before sending reset link
          const restricted = await db.restricteds.findOne({ where: { email: memberEmail }, });
          if( restricted !== null){ return next(new ErrorResponse('Email restricted from password change', 401)); } 

          // generate reset token and save to the member's record for when they click on reset in email
          // grab token and send to email
          const resetPWToken = await generateResetToken(member);

          // Create reset url
          const myPasswordResetURL = process.env.PASSWORD_RESET_TARGET + resetPWToken;

          devLog("myPasswordResetURL: " + myPasswordResetURL);

          const message = `You are receiving this email because you requested a password reset link. Please click on the following link to reset your password: \n\n ${myPasswordResetURL}`;

            // only send email if the environment is test or production
            if (!process.env.NODE_ENV === "dev")
            {
              const sendResult = await sendEmail({
                email: member.email,
                subject: 'Password Reset Link',
                message,
              });
            }

            res.status(200).json({
              success: true,
              data: "Email with password reset link was generated and sent to member",
            });
  });

  const generateResetToken = asyncHandler(async (member) => {

    // generate email reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
  
    const resetPWToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    const expirationDate = Date.now() + 5 * 60 * 60 * 1000; // five hours from now

    // save member 
    member.set({passwordResetToken: resetPWToken, passwordResetExpire: expirationDate});
  
    const updatedMember = await member.save();
    devLog("updatedMember: " + JSON.stringify(updatedMember)); 
  
    const resetTokenExtend = crypto.randomBytes(100).toString('hex');
    const resetTokenCombined = `${resetToken}.${resetTokenExtend}`;
    return resetTokenCombined;
  });

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  devLog(" resetPassword "); 
  devLog("req.body.token: " + JSON.stringify(req.body.token))

  // Get hashed token
  const splitToken = req.body.token.split('.')[0];
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(splitToken)
    .digest("hex");

    // Get member from db
    const member = await db.members.findOne({ where: { passwordResetToken: resetPasswordToken }, });
    if( member === null){ return next(new ErrorResponse('Invalid credentials', 401)); } 

    devLog("member: " + JSON.stringify(member)); 
          
    // check expiration is in the future
    if(member.passwordResetExpire < Date.now()) {
      { return next(new ErrorResponse('Password Reset token already expired', 401)); } 
    }

    // save member 
    member.set({
      password: bcrypt.hashSync(req.body.password, 8),
      passwordResetToken: null, 
      passwordResetExpire: null});
  
    const updatedMember = await member.save();
    devLog("updatedMember: " + JSON.stringify(updatedMember)); 

  sendTokenResponse(updatedMember, 200, res);
});

//  @desc   Confirm Member email
//  @route  GET /api/v1/auth/confirmemail/?token=
//  @access Public
exports.confirmEmail = asyncHandler(async (req, res, next) => {

  devLog(" confirmEmail "); 

    // grab token from email
    const { token } = req.query;

    devLog("token: " + token); 

    if (!token) {
      return next(new ErrorResponse('Invalid Token', 400));
    }
 
    const splitToken = token.split('.')[0];
    const confirmEmailToken = crypto
      .createHash('sha256')
      .update(splitToken)
      .digest('hex');
   
    devLog("confirmEmailToken: " + confirmEmailToken);

     // get member by token
  const member = await db.members.findOne( { where:
    {emailConfirmationToken: confirmEmailToken}
  });

  if( member === null){ return next(new ErrorResponse('Invalid token', 400)); } 

  devLog("member: " + JSON.stringify(member));

  // update confirmed to yes
  member.set({emailConfirmationToken: "", isEmailConfirmed: "yes", role:"verified"});

  // save member record with updates
  await member.save();

  // return updated user
  sendTokenResponse(member, 200, res);
});

//  @desc   Get current member
//  @route  GET /api/v1/auth/getcurrentmember
//  @access Private
exports.getCurrentMember = asyncHandler(async (req, res, next) => {

    devLog(" getCurrentMember "); 

    // return updated member record, with fresh token
    sendTokenResponse(req.member, 200, res);
});

const generateEmailConfirmToken = asyncHandler(async (member) => {
          // email confirmation token
          const confirmationToken = crypto.randomBytes(20).toString('hex');

          const confirmEmailToken = crypto
            .createHash('sha256')
            .update(confirmationToken)
            .digest('hex');

          // save member with THIS in the db 
          member.set({emailConfirmationToken: confirmEmailToken});

          await member.save();

          const confirmTokenExtend = crypto.randomBytes(100).toString('hex');
          const confirmTokenCombined = `${confirmationToken}.${confirmTokenExtend}`;
          return confirmTokenCombined;
    });

//  @desc   Register new member
//  @route  POST /api/v1/auth/register
//  @access Public
exports.registerMember = asyncHandler(async (req, res, next) => {
    
    // logger(req); 

    devLog(" registerMember");    

    const { username, email, password, role } = req.body;
    devLog( "body data: " + '\n' + "username: " + username + '\n' + "email: " + email + '\n' + "password: " + password, + " role " + role); 

    // now check for uniqueness of email and userName
    const memberEmailCheck = await db.members.findOne({ where: { email: email }});
    // devLog("Result of email uniqueness check: " + JSON.stringify(memberEmailCheck));
    if( memberEmailCheck !== null){ return next(new ErrorResponse('Email already used', 401)); } 

    const memberUserNameCheck = await db.members.findOne({ where: { userName: username }});
    // devLog("Result of member name uniqueness check: " + JSON.stringify(memberUserNameCheck));
    if( memberUserNameCheck !== null){ return next(new ErrorResponse('User name already used', 401)); } 

    // check global block list for email before proceeding
    const memberBlock = await db.restricteds.findOne({ where: { email: email }});
    devLog( "memberBlock: " + JSON.stringify(memberBlock));
    if( memberBlock !== null){ return next(new ErrorResponse('Email restricted', 401)); } 

    // if no block, then create new member
    const member = await db.members.create({
      userName: username,
      email: email,
      password: bcrypt.hashSync(password, 8), 
      role: role
    });

    devLog( "member: " + JSON.stringify(member)); 

    // Approach: generate email confirm token and save to the member's record for when they validate their email address
    // grab token and send to email
    const confirmEmailToken = await generateEmailConfirmToken(member);

    // process.env.NODE_ENV
    // Create reset url
    const myconfirmEmailURL = process.env.EMAIL_VALIDATION_TARGET + confirmEmailToken;

    devLog( "myconfirmEmailURL: " + myconfirmEmailURL);

    const message = `You are receiving this email because you need to confirm your email address. Please make a GET request to: \n\n ${myconfirmEmailURL}`;
  
      const sendResult = await sendEmail({
        email: member.email,
        subject: 'Email Confirmation Link',
        message,
      });
    
    sendTokenResponse(member, 200, res);
  });

//  @desc   Resend registration email for new member
//  @route  get /api/v1/auth/resend
//  @access Private
exports.resendEmail = asyncHandler(async (req, res, next) => {  

    devLog("resendEamil triggered.  Member making request: " + JSON.stringify(req.member)); 
    // approach: generate email confirm token and save to the member's record for when they validate their email address
    // grab token and send to email
    const confirmEmailToken = await generateEmailConfirmToken(req.member);

    // process.env.NODE_ENV
    // create reset url
    const myconfirmEmailURL = process.env.EMAIL_VALIDATION_TARGET + confirmEmailToken;

    devLog("myconfirmEmailURL: " + myconfirmEmailURL);

    const message = `You are receiving this email because you need to confirm your email address. Please make a GET request to: \n\n ${myconfirmEmailURL}`;
  
    let sendResult = null;
    
      devLog("about to trigger sendEmail within resend Email block");
      sendResult = await sendEmail({
      email: req.member.email,
      subject: 'Email Confirmation Link',
      message,
    });
    
    devLog("sendResult: " + JSON.stringify(sendResult)); 
    res.status(200).json({
      success: true,
      emailCreationDetails: sendResult,
      data: "Email with registration link was generated and sent to member",
    });
});

//  @desc   Login member
//  @route  Post /api/v1/auth/login
//  @access Public
exports.loginMember = asyncHandler(async (req, res, next) => {
      devLog(" loginMember "); 
      devLog(JSON.stringify(req.body));
      const { email, password } = req.body;
      // validate emil & password
      if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
      }
      // get member from db
      const member = await db.members.findOne({ where: { email: email }, });
      if( member === null){ return next(new ErrorResponse('Invalid credentials', 401)); } 

      // the pw from db will be encrypted 
      const isMatch = bcrypt.compareSync(
        password,
        member.password
          );
      if (!isMatch) {
        devLog("invalid creditials");
        return next(new ErrorResponse('Invalid credentials', 401));
      }
      sendTokenResponse(member, 200, res);
  });

  // get token from model, create cookie and send response
const sendTokenResponse = (member, statusCode, res) => {
      // create token
      const token = getSignedJwtToken(member);
      devLog("sendTokenResponse called with member: " + JSON.stringify(member));
      const options = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
        ),
        httpOnly: true,
      };
      if (process.env.NODE_ENV === 'production') {
        options.secure = true;
      }
      res
      .status(statusCode)
      .cookie('token', token, options)
      .json({
        member,
        success:true,
        token
      });
};

getSignedJwtToken = function (member) {
  return jwt.sign({ id: member.id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRE,
      });
};

// @desc      Log member out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Public
exports.logoutMember = asyncHandler(async (req, res, next) => {
  devLog(" logoutMember "); 
  devLog(JSON.stringify(res.cookie.JSON));
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: "user logged out"
  });
});

// @desc      Change member password
// @route     PUT /api/v1/auth/changePassword
// @access    Private
exports.changePassword = asyncHandler(async (req, res, next) => {

  devLog("changePassword controller entered")

  const { newPassword } = req.body;

  devLog("value of newPassword is: " + JSON.stringify(newPassword))

  // update and save member record
  req.member.set({
    password: bcrypt.hashSync(newPassword, 8)
  });

  const updatedMember = await req.member.save();

  sendTokenResponse(updatedMember, 200, res);
});