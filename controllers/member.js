var fs = require('fs');
const ErrorResponse = require("../utils/ErrorResponse");
const linkChurchStream = require("../utils/linkChurchStream");
const asyncHandler = require("../middleware/async");
const { Sequelize, Model } = require('sequelize');
const db = require("../models");
const devLog = require("../utils/devLog");

//  @desc   Update member church
//  @route  PUT /api/v1/member/church
//  @access Private
exports.updateMemberChurch = asyncHandler(async (req, res, next) => {
  devLog(" updateMemberChurch "); 

  // retrieve church before proceeding further
  const { inviteCode } = req.body;
  const church = await db.churches.findOne({ where: { invitationCode: inviteCode }, });
  if( church === null){ return next(new ErrorResponse('No church found', 401)); } 

  // get default church stream
  let streaminfo = await linkChurchStream(req.member);

  //  check invite code 
  devLog("church.invitationCode: " + JSON.stringify(church.invitationCode));
  devLog("inviteCode: " + JSON.stringify(inviteCode));
  if (church.invitationCode !== inviteCode) {
    return next(new ErrorResponse('invite code provided does not match church invite code', 401));
  }

  // update and save member record
  req.member.set({
    currentStreamId: streaminfo.commentKey.streamId,
    role: "member"
  });

  const updatedMember = await req.member.save();
  
  // debug
  devLog("updatedMember: " + JSON.stringify(updatedMember));

  res.status(200).json({
    success: true,
    member: updatedMember,
    streamInfo: streaminfo
  });
});
    

//  @desc   Update member introduction
//  @route  PUT /api/v1/member/introduction/:id
//  @access Private
exports.updateIntroduction = asyncHandler(async (req, res, next) => {
  devLog(" updateIntroduction "); 

    req.member.set({
      introduction: req.body.introduction
    });
    const updatedMember = await req.member.save();

    res.status(200).json({
      success: true,
      data: updatedMember,
    });
  });

//  @desc   Upload member profile pic
//  @route  POST /api/v1/member/profilepic
//  @access Private
exports.uploadPic = asyncHandler(async (req, res, next) => {
  devLog(" uploadPic "); 

  const { profilePic  } = req.body;
  if(!profilePic) { return next(new ErrorResponse('No pic detected', 401)); } 

  req.member.set({profilePic: profilePic});
  const updatedMember = await req.member.save();

  res.status(200).json({
    success: true,
    data: updatedMember
  });
});

//  @desc   Update member stream
//  @route  PUT /api/v1/member/stream
//  @access Private
exports.updateStream = asyncHandler(async (req, res, next) => {
  devLog(" updateStream "); 

  const { streamId } = req.body;

  req.member.set({currentStreamId: streamId});
  const updatedMember = await req.member.save();
  if( updatedMember === null){ return next(new ErrorResponse('Member not updated during joinStream controller method', 401)); } 

  res.status(200).json({
    success: true,
    data: updatedMember
  });
});

//  @desc   Join stream - Member triggers this
//  @route  POST /api/v1/member/joinstream
//  @access Private
exports.joinStream = asyncHandler(async (req, res, next) => {
  devLog(" joinStream "); 

  const { streamId } = req.body;
  let keyObject = {};

  // if streammember record already exists then separate the flow
  const existingStreamMember = await db.streammembers.findOne({ where: { memberId: req.member.id, streamId: streamId }});
 
    if( existingStreamMember === null) {
        const newStreamMember = await db.streammembers.create({
          memberId: req.member.id,
          streamId: streamId,
          participantType: req.member.role,
          status: "normal"
        })
      
        if( newStreamMember === null){ return next(new ErrorResponse('streamMember record not created during joinStream controller method', 401)); } 
      
        keyObject = {
          streamId: streamId,
          streammembers: [{
            participantType: newStreamMember.participantType,
            status: newStreamMember.status,
            streamMemberId: newStreamMember.id
          }]
        }
    }
  else {
        // if streammember exists, then check for one of two possiblities - 'memberleftstream' or 'restricted'
        // restricteds should not be able to join the stream again until a moderator lifts the restriction
            if (existingStreamMember.status === "memberleftstream") {
              existingStreamMember.set({
                status: "normal"
              });
              existingStreamMember.save();

              keyObject = {
                streamId: streamId,
                streammembers: [{
                  participantType: existingStreamMember.participantType,
                  status: existingStreamMember.status,
                  streamMemberId: existingStreamMember.id
                }]
              }
            }
            else {
              // streammember with 'restricted' status will filter to here
              { return next(new ErrorResponse('Error: stream could not be joined.', 401)); } 
            }
        }

  // update the member record with current stream 
  req.member.set({currentStreamId: streamId});
  const updatedMember = await req.member.save();
  if( updatedMember === null){ return next(new ErrorResponse('Member not updated during joinStream controller method', 401)); } 

  res.status(200).json({
    success: true,
    member: updatedMember,
    streamHeaderKey: keyObject
  });
});

//  @desc   Update member account
//  @route  PUT /api/v1/member/account
//  @access Private
exports.updateAccount = asyncHandler(async (req, res, next) => {
  devLog(" updateAccount "); 

  const { userName, email } = req.body;

  let userNameChanged = false;
  let emailChanged = false;

  if(req.member.userName !== userName) {
    userNameChanged = true;
  }
  if(req.member.email !== email) {
    emailChanged = true;
  }

  if(emailChanged) {
    // now check for uniqueness of email and userName
    const memberEmailCheck = await db.members.findOne({ where: { email: email }});
    // devLog("memberEmailCheck: " + JSON.stringify(memberEmailCheck));
    if( memberEmailCheck !== null){ return next(new ErrorResponse('Email already used', 401)); } 

    // check global block list for email before proceeding
    const memberBlock = await db.restricteds.findOne({ where: { email: email }});
    devLog("memberBlock: " + JSON.stringify(memberBlock));
    if( memberBlock !== null){ return next(new ErrorResponse('Email restricted', 401)); } 

    // check if existing email is already on global block list - member should not be able to change their email to evade it
    const oldMemberBlock = await db.restricteds.findOne({ where: { email: req.member.email }});
    devLog("oldMemberBlock: " + JSON.stringify(oldMemberBlock));
    if( oldMemberBlock !== null){ return next(new ErrorResponse('Email changing restricted for member', 401)); } 
  }

  if(userNameChanged) {
    const memberUserNameCheck = await db.members.findOne({ where: { userName: userName }});
    // devLog("memberUserNameCheck: " + JSON.stringify(memberUserNameCheck));
    if( memberUserNameCheck !== null){ return next(new ErrorResponse('User name already used', 401)); } 
  }

  // after checking, update
    req.member.set({userName: userName, email: email});
    let updatedMember = await req.member.save();

  res.status(200).json({
    success: true,
    data: updatedMember
  });
});

//  @desc   Create Member Fact
//  @route  POST /api/v1/member/fact
//  @access Private
exports.createMemberFact = asyncHandler(async (req, res, next) => {
  devLog(" createMemberFact "); 

  const {description, value } = req.body;

  const fact = await db.memberfacts.create({
    memberId: req.member.id,
    description: description,
    fact: value
  });

  if( fact === null){ 
    return next(new ErrorResponse('Error: fact not created', 401)); 
  } 

    res.status(200).json({
      success: true,
      fact: fact
    });
  });

//  @desc   Get Member Facts
//  @route  GET /api/v1/member/fact
//  @access Private
exports.getMemberFacts = asyncHandler(async (req, res, next) => {
  devLog(" getMemberFacts "); 
  const facts = await db.memberfacts.findAll({ where: { 
    memberId: req.member.id
  },
    attributes: [['id', 'id'],['memberId','memberId'],['description','description'],['fact','fact'],['createdAt','createdAt']],
    limit: 300,
    order: ['createdAt']
  })

    res.status(200).json({
      success: true,
      facts: facts
    });
  });

//  @desc   Edit Member Fact
//  @route  PUT /api/v1/member/fact
//  @access Private
exports.editMemberFact = asyncHandler(async (req, res, next) => {
  devLog(" editMemberFact "); 

  const {id, updatedDescription, updatedValue } = req.body;

  devLog("id: " + JSON.stringify(id));
  devLog("updatedDescription: " + JSON.stringify(updatedDescription));
  devLog("updatedValue: " + JSON.stringify(updatedValue));

  const fact = await db.memberfacts.findOne({ where: { id: id, memberId: req.member.id }});

  if( fact === null){ return next(new ErrorResponse('No fact found', 401)); } 

    // update and save member fact
    fact.set({
      description: updatedDescription,
      fact: updatedValue
    });
  
    const updatedFact = await fact.save();

    res.status(200).json({
      success: true,
      updatedFact: updatedFact
    });
  });


//  @desc   Delete Member Fact
//  @route  DEL /api/v1/member/fact/:factId
//  @access Private
exports.deleteMemberFact = asyncHandler(async (req, res, next) => {
  devLog(" deleteMemberFact "); 

  const factId = parseInt(req.params.factId); 

  devLog("factId: " + JSON.stringify(factId))

  const deleteResult = await db.memberfacts.destroy({
      where: {
          id: factId, 
          memberId: req.member.id
      }
  })

  devLog("deleteResult: " + JSON.stringify(deleteResult))

    res.status(200).json({
      success: true,
      deleteResult: deleteResult
    });
  });


