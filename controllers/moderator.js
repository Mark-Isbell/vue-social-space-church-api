const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/async");
const { Sequelize, Model } = require('sequelize');
const { verify } = require("crypto");
const bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken");
const crypto = require('crypto');
const db = require("../models");
const sendEmail = require('../utils/sendEmail'); 
const devLog = require("../utils/devLog");

//  @desc   Update stream access request
//  @route  PUT /api/v1/moderator/updaterequest
//  @access Private
exports.updateRequest = asyncHandler(async (req, res, next) => { 
    devLog(" updateRequest "); 

    const { moderatorMessageId, status, moderatorResponse } = req.body;

    // get moderator message
    const moderatormessage = await db.moderatormessages.findOne({ where: { id: moderatorMessageId }, });
    if( moderatormessage === null){ return next(new ErrorResponse('No moderator message found', 401)); } 

    // get member record of person requesting for purposes of getting their role
    const member = await db.members.findOne({ where: { id: moderatormessage.keyfieldmemberId}});
    if( member === null){ return next(new ErrorResponse('No member found in updateRequest controller method', 401)); } 

    // check for an existing streammember record
    const existingStreamMember = await db.streammembers.findOne({ where: { 
      memberId: moderatormessage.keyfieldmemberId,
      streamId: moderatormessage.keyfieldstreamId
     }, });

     // debug
     devLog("existingStreamMember: " + JSON.stringify(existingStreamMember));

    if (status==="approved" && existingStreamMember === null) {
        const streammember = await db.streammembers.create({
            memberId: moderatormessage.keyfieldmemberId,
            streamId: moderatormessage.keyfieldstreamId,
            participantType: member.role,
            status: "normal"
        });
    } 
    if (existingStreamMember !== null) {
      // if Streammember record already exists, update the status
      if (existingStreamMember.status === "memberleftstream") {
        existingStreamMember.set({
          status: "normal"
        });
        existingStreamMember.save();
      }
      else {
        // error condition since this should not be possible
        return next(new ErrorResponse('Error encountered during updateRequest controller method', 401)); 
      }
    }

    // save member with THIS in the db 
    moderatormessage.set({
        status: status,
        moderatorResponse: moderatorResponse
    });

    const updatedMessage = await moderatormessage.save();
  
  res.status(200).json({
    success: true,
    request: updatedMessage
  });
});
    
//  @desc   Get pending moderator requests
//  @route  GET /api/v1/moderator/getpendingrequests
//  @access Private
exports.getPendingRequests = asyncHandler(async (req, res, next) => {

    devLog(" getPendingRequests "); 

        const pendingRequests = await db.moderatormessages.findAll({
          where: {
            'status': 'pending',
            'type': 'streamjoinrequest' 
          },
          attributes:[['id','moderatorMessageId'], 'type', 'message', 'status',['keyfieldmemberId','memberId'],['keyfieldstreamId','streamId'],'moderatorResponse','createdAt'],
          include: 
            [{
              model: db.streams,
              as: 'stream', 
              attributes: [['name','streamName'],['type','streamType'],['status','streamStatus']]  
            },
            {
              model: db.members,
              as: 'member', 
              attributes: ['userName']  
            }]
        });

      // null is okay to return
      devLog("pendingRequests: " + JSON.stringify(pendingRequests));

  res.status(200).json({
    success: true,
    requests: pendingRequests
  });
});

//  @desc   Report Comment
//  @route  POST /api/v1/moderator/reportcomment
//  @access Private
exports.reportComment = asyncHandler(async (req, res, next) => {
  devLog(" reportComment "); 

  const { 
    message,
    KeyFieldMemberId,
    KeyFieldStreamId,
    KeyFieldStreamCommentId
   } = req.body;

   // double check stream is associated with member's church
  const stream = await db.streams.findOne({ where: { id: KeyFieldStreamId}});
  if( stream === null){ return next(new ErrorResponse('No stream found', 401)); } 

 
  const moderatormessage = await db.moderatormessages.create({
    type: "commentmoderation",
    message: message, // contains member id and userName of reporter
    status: "pending",
    moderatorResponse: "",
    moderatorAction: "",
    moderatorRestriction: "",
    keyfieldmemberId: KeyFieldMemberId, // member Id of the commentor
    keyfieldstreamId: KeyFieldStreamId,
    keyfieldstreamcommentId: KeyFieldStreamCommentId
  });

  if(moderatormessage === null){ return next(new ErrorResponse('reportComment controller: comment not reported', 401)); }
  
  devLog("moderatormessage: " + JSON.stringify(moderatormessage));

      res.status(200).json({
      success: true,
      moderationReport: moderatormessage
    });
  });

//  @desc   Complete Moderation Message
//  @route  PUT /api/v1/moderator/complete
//  @access Private
exports.complete = asyncHandler(async (req, res, next) => {

  devLog(" complete "); 

  const { 
    messageId,
    moderatorResponse,
    moderatorAction,
    moderatorRestriction
   } = req.body;

   // retrieve the message
  const moderatorMessage = await db.moderatormessages.findOne({ where: { id: messageId}});
  if( moderatorMessage === null){ return next(new ErrorResponse('No moderator message found', 401)); } 

  // update and save streammember record
  moderatorMessage.set({
    status: "completed",
    moderatorResponse: moderatorResponse,
    moderatorAction: moderatorAction,
    moderatorRestriction: moderatorRestriction
  });

  const updatedModeratorMessage = await moderatorMessage.save();

  devLog("updatedModeratorMessage: " + JSON.stringify(updatedModeratorMessage));

      res.status(200).json({
      success: true,
      moderatorMessage: updatedModeratorMessage
    });
  });

//  @desc   Retreives all reports about comments
//  @route  GET /api/v1/moderator/reports
//  @access Private
exports.getReports = asyncHandler(async (req, res, next) => {

  devLog(" getReports "); 

   // get all reports needing moderation
  const reports = await db.moderatormessages.findAll({ where: {type: 'commentmoderation', status: 'pending'}});
  devLog("reports: " + JSON.stringify(reports)); 

      res.status(200).json({
      success: true,
      reports: reports
    });
  });

//  @desc   Delete member comment as result of moderation of a report
//  @route  DELETE /api/v1/moderator/deletecomment/:commentId
//  @access Private
exports.deleteMemberComment = asyncHandler(async (req, res, next) => {

  devLog(" deleteMemberComment "); 

  if(req.member.role !== "moderator"){ return next(new ErrorResponse('deleteMemberComment controller: user is not a moderator', 401)); }

  // get comment ID
  const commentId = parseInt(req.params.commentId)

  // get comment
  const comment = await db.streamcomments.findOne({ where: { id: commentId }});
  if( comment === null){ return next(new ErrorResponse('No comment found', 401)); } 

  // get stream
  const stream = await db.streams.findOne({ where: { id: comment.streamId }});
  if( stream === null){ return next(new ErrorResponse('No stream found', 401)); } 

  // delete the comment after verifying that it exists and it is connected to moderator's church
  const deleteResult = await db.streamcomments.destroy({
    where: {
        id: comment.id
    }
  })

  devLog("deleteResult: " + JSON.stringify(deleteResult))

    res.status(200).json({
      success: true,
      deleteResult: deleteResult,
    });
  });

//  @desc   Restrict a member from posting in one specific stream
//  @route  PUT /api/v1/moderator/restrictone
//  @access Private
exports.restrictOneStream = asyncHandler(async (req, res, next) => {

  devLog(" restrictOneStream "); 

  const { streamId, memberId } = req.body;

  // get streammember record
  const streammember = await db.streammembers.findOne({ where: { memberId: memberId, streamId: streamId }});
  if( streammember === null){ return next(new ErrorResponse('No streammember record found in restrictOneStream controller', 401)); } 

  // update and save streammember record
  streammember.set({
    status: "restricted"
  });

  const updatedStreamMember = await streammember.save();

  res.status(200).json({
    success: true,
    streamMemberRecord: updatedStreamMember
  });
});

//  @desc   Restrict a member from posting in all their *current* streams
//  @route  PUT /api/v1/moderator/restrictall
//  @access Private
exports.restrictAllStreams = asyncHandler(async (req, res, next) => {

  devLog(" restrictAllStreams "); 

  const {memberId } = req.body;

    const currentStreamMemberRecords = await db.streammembers.findAll({
      where: {
        memberId: memberId
      },
      attributes:['id']
    });

  // null should not be returned - member should always have one at this stage of moderation
  devLog("currentStreamMemberRecords: " + JSON.stringify(currentStreamMemberRecords));

    let i = currentStreamMemberRecords.length;
    for(j=0;j<i;j++) {
                // get streammember record 
                // devLog("currentStreamMemberRecords[0].streamMemberId is: " + JSON.stringify(currentStreamMemberRecords[0]`)); 
                devLog("value of j is: " + j); 
                devLog("currentStreamMemberRecords[j].id: " + JSON.stringify(currentStreamMemberRecords[j].id));
                let streammember = await db.streammembers.findOne({ where: { id: currentStreamMemberRecords[j].id}});
                if( streammember === null){ return next(new ErrorResponse('No streammember record found in restrictAllStreams update loop', 401)); } 

                // update and save streammember record
                streammember.set({
                  status: "restricted"
                });

                await streammember.save();
    }

    // now get the updated streammember records and return them
      const updatedStreamMemberRecords = await db.streammembers.findAll({
        where: {
          memberId: memberId
        },
        attributes:[['id','streamMemberId'],'status']
      });

    // null should not be returned 
    devLog("updatedStreamMemberRecords: " + JSON.stringify(updatedStreamMemberRecords));

    res.status(200).json({
      success: true,
      streamMemberRecords: updatedStreamMemberRecords
    });
});

//  @desc   Remove from church
//  @route  PUT /api/v1/moderator/removefromchurch
//  @access Private
exports.removeFromChurch = asyncHandler(async (req, res, next) => {

  devLog(" removeFromChurch "); 

  const { 
    memberId,
    moderatorMessageId
   } = req.body;

  // get member 
  const member = await db.members.findOne({ where: { id: memberId }}); 
  if( member === null){ return next(new ErrorResponse('Member not found for removeFromChurch controller', 401)); } 

  // the restricted table is only for church level blocks to joining:  NOT for POSTING restrictions -> those go in streammember status

  // first check if member already removed and placed in restricted table
  const existingRestricted = await db.restricteds.findOne({ where: { memberId: memberId }}); 
  if( existingRestricted === null){ 
    const restricted = await db.restricteds.create({
      memberId: memberId,
      moderatormessageId: moderatorMessageId,
      email: member.email, // latest version of members email here
      restrictionType: "church" // 'global is the other type in federated version but even there it is only available for TOS violations'
    });
    if( restricted === null){ return next(new ErrorResponse('Restriction not created', 401)); } 
   } 

    const currentStreamMemberRecords = await db.streammembers.findAll({
      where: {
        memberId: memberId
      },
      attributes:['id']
    });

    // null should not be returned - member should always have one at this stage of moderation
    devLog("currentStreamMemberRecords: " + JSON.stringify(currentStreamMemberRecords));

  let i = currentStreamMemberRecords.length;
  for(j=0;j<i;j++) {
              // get streammember record
              devLog("currentStreamMemberRecords[j].streamMemberId: " + JSON.stringify(currentStreamMemberRecords[j].id));
              let streammember = await db.streammembers.findOne({ where: { id: currentStreamMemberRecords[j].id}});
              if( streammember === null){ return next(new ErrorResponse('No streammember record found', 401)); } 

              // update and save streammember record
              streammember.set({
                status: "restricted"
              });
              await streammember.save();
      }

      // create a new password here
      let newPassword = generateRandomPasswordPlainText();

      // set new password for member and null out current streamId
        member.set({
          password: bcrypt.hashSync(newPassword, 8)
        });

        const updatedMember = await member.save();

      res.status(200).json({
      success: true,
      member: updatedMember
    });
  });

//  @desc   Promote member to moderator role
//  @route  PUT /api/v1/moderator/promote
//  @access Private
exports.promoteModerator = asyncHandler(async (req, res, next) => {

      devLog(" promoteModerator "); 

      const { 
        memberId
      } = req.body;

      // get member and check for same church as moderator
      const member = await db.members.findOne({ where: { id: memberId }}); 
      if( member === null){ return next(new ErrorResponse('Member not found for removeFromChurch controller', 401)); } 

      member.set({
        role: "moderator"
      });

      const updatedMember = await member.save();

      // update all streammember records for newly promoted moderator

      const currentStreamMemberRecords = await db.streammembers.findAll({
        where: {
          memberId: memberId
        },
        attributes:['id']
      });

      // null should not be returned - member should always have one at this stage promotion
      devLog("currentStreamMemberRecords: " + JSON.stringify(currentStreamMemberRecords));

      let i = currentStreamMemberRecords.length;
      for(j=0;j<i;j++) {
                  // get streammember record 
                  devLog("value of j is: " + j); 
                  devLog("currentStreamMemberRecords[j].id: " + JSON.stringify(currentStreamMemberRecords[j].id));
                  let streammember = await db.streammembers.findOne({ where: { id: currentStreamMemberRecords[j].id}});
                  if( streammember === null){ return next(new ErrorResponse('No streammember record found in promoteModerator update loop', 401)); } 

                  // update and save streammember record
                  streammember.set({
                    participantType: "moderator"
                  });
                  await streammember.save();
      }
      res.status(200).json({
      success: true,
      member: updatedMember
    });
  });

//  @desc   Add member to stream
//  @route  PUT /api/v1/moderator/addtostream
//  @access Private
exports.addToStream = asyncHandler(async (req, res, next) => {

  devLog(" addToStream "); 

  const { 
    memberId,
    streamId
   } = req.body;

  // check for valid member
  const member = await db.members.findOne({ where: { id: memberId }}); 
  if( member === null){ return next(new ErrorResponse('Member not found', 401)); } 

  // check for valid stream
  const stream = await db.streams.findOne({ where: { id: streamId }}); 
  if( stream === null){ return next(new ErrorResponse('Stream not found', 401)); } 

  const streamMember = await db.streammembers.create({
    memberId: member.id,
    streamId: streamId,
    participantType: member.role,
    status: "normal"
  })

  if( streamMember === null){ return next(new ErrorResponse('streamMember record not created', 401)); } 

      res.status(200).json({
      success: true,
      streammember: streamMember
    });
  });

//  @desc   Get all member restrictions
//  @route  GET /api/v1/moderator/getallrestrictions/:userName
//  @access Private
exports.getAllRestrictions = asyncHandler(async (req, res, next) => {

  devLog(" getAllRestrictions "); 

  const userName = req.params.userName;
  devLog("userName: " + JSON.stringify(userName));

  let returnObject = {};

returnObject.searchStatus = ""
returnObject.memberSearchResult = {};
returnObject.churchLevelRestriction = "None"; 
returnObject.numberOfStreamRestrictions = 0;
returnObject.streamRestrictions = [];

  const member = await db.members.findOne({ where: { userName: userName },
    attributes: [
    ['id','id'],
    ['userName','userName'],
    ['role','role']
  ]
   });

  devLog("member: " + JSON.stringify(member))

    if( member === null) { return next(new ErrorResponse('Member not found in getAllRestrictions controller', 401)); } 
    else {
      returnObject.memberSearchResult = member;
      returnObject.searchStatus = "Member found: " + member.userName;
    }

  // find any church level restrictions (restrictions on joining this specific church)
  const restricted = await db.restricteds.findOne({
    where: { memberId: member.id, restrictionType: "church"}
  }) 
  if( restricted !== null){ 
    returnObject.churchLevelRestriction = "Church restriction: Member cannot join moderator's church."
  } 

      const streamMemberRecords = await db.streammembers.findAll({
        where: {
          memberId: member.id,
          status: 'restricted'
        },
        attributes:['streamId', ['id','streamMemberId'],['status','streamMemberStatus'],['memberId','memberId']],
        include: 
        [{
          model: db.streams,
          as: 'stream', 
          attributes: [['name','streamName'],['type','streamType'],['status','streamStatus']]  
        }]
      });

    // null may be returned
    devLog("streamMemberRecords: " + JSON.stringify(streamMemberRecords));

  if(streamMemberRecords.length > 0) {
    returnObject.numberOfStreamRestrictions = streamMemberRecords.length; 
    returnObject.streamRestrictions = streamMemberRecords;
  }

    res.status(200).json({
      success: true,
      restrictionObject: returnObject
    });
});

//  @desc   Unrestrict a member from not posting in a specific stream
//  @route  PUT /api/v1/moderator/unrestrict
//  @access Private
exports.unrestrict = asyncHandler(async (req, res, next) => {

  devLog(" unrestrict "); 

  const { 
    memberId,
    streamId
   } = req.body;

   devLog("memberId: " + memberId + " streamId: " + streamId); 

   // check for stream
    const stream = await db.streams.findOne({
      where: { id: streamId }
    }) 
    if( stream === null){ return next(new ErrorResponse('Stream not found', 401)); } 

    // get streamMember record and update
    const streamMember = await db.streammembers.findOne({ where: { memberId: memberId, streamId: streamId, status: 'restricted' }}); 
    if( streamMember === null){ return next(new ErrorResponse('Streammember record not found', 401)); } 

    streamMember.set({
      status: "normal"
    });

    const updatedStreamMember = await streamMember.save();

        res.status(200).json({
        success: true,
        StreamMember: updatedStreamMember
      });
  });

//  @desc   Undo a restriction that prevents member from joining the churc
//  @route  PUT /api/v1/moderator/unrestrictchurchjoin
//  @access Private
exports.unrestrictChurchJoin = asyncHandler(async (req, res, next) => {

        devLog(" unrestrictChurchJoin "); 

        const { 
          memberId
        } = req.body;

        devLog("memberId: " + memberId); 

        // get member from db
        const member = await db.members.findOne({ where: { id: memberId }, });

        if( member === null){ return next(new ErrorResponse('Invalid credentials', 401)); } 

        // get restricted record to verify first and then delete
        const restrictedRecord = await db.restricteds.findOne({ where: { memberId: memberId }}); 
        if( restrictedRecord === null){ return next(new ErrorResponse('Restricted record not found for member', 401)); } 

        // delete the restricted record after verifying that it exists 
        const deleteResult = await db.restricteds.destroy({
          where: 
          {
            id: restrictedRecord.id
          }
        })

        if(deleteResult !== 1) { return next(new ErrorResponse('restriction not deleted', 401)); } 

        devLog("deleteResult: " + JSON.stringify(deleteResult)); 

        // after church restriction lifted, send member a password reset link
        // generate reset token and save to the member's record for when they click on reset in email

        // grab token and send to email
        const resetPWToken = await generateResetToken(member);

        // create reset url
        const myPasswordResetURL = process.env.PASSWORD_RESET_TARGET + resetPWToken;

        devLog("myPasswordResetURL: " + myPasswordResetURL);

        const message = `Please click on the following link to reset your password: \n\n ${myPasswordResetURL}`;

        // only send email if the environment is test or production
        if (!process.env.NODE_ENV === "dev")
        {
          const sendResult = await sendEmail({
            email: member.email,
            subject: 'Password Reset Link',
            message,
            });
        }    

        let additionalInformation = "Password reset sent to email on file: " + member.email + "."

        res.status(200).json({
        success: true,
        deleteResult: deleteResult,
        additionalInformation: additionalInformation
        });
  });

  const generateResetToken = asyncHandler(async (member) => {

    // generate email reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
  
    const resetPWToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    const expirationDate = Date.now() + 5 * 60 * 60 * 1000; // pretty sure that's five hours from now

    // save member with this 
    member.set({passwordResetToken: resetPWToken, passwordResetExpire: expirationDate});
  
    const updatedMember = await member.save();
    devLog("here is the member with reset token: " + JSON.stringify(updatedMember)); 
  
    const resetTokenExtend = crypto.randomBytes(100).toString('hex');
    const resetTokenCombined = `${resetToken}.${resetTokenExtend}`;
    return resetTokenCombined;
  });

  function generateRandomPasswordPlainText () {
    const chars = ["A","B","C","E","F","G","H","I","K","L","P","Q","R","T","2","3","4","6","7","8","9","Y","U","W","X","Z","V","*","-","_"]
    newCode = []
    for (let i=0;i<40;i++) {
        let rando = Math.floor(Math.random()*29)
        if (rando > 29) {continue}
        newCode.push(chars[rando]);
        if (newCode.length > 10)
        {break;}
    }
    let newRandomPassWord = "" + newCode[0] + newCode[1] + newCode[2] + newCode[3] + newCode[4] + newCode[5] + newCode[6] + newCode[7] + newCode[8] + newCode[9];
    
    return newRandomPassWord;
}