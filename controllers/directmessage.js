const path = require("path");
const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/async");
const { Op,Sequelize, Model } = require('sequelize');
const db = require("../models");
const devLog = require("../utils/devLog");

//  @desc   Get older comments for a directmessage as user scrolls upward
//  @route  GET /api/v1/directmessage/:id/:oldestDirectMessageCommentId/older
//  @access Private
exports.getOlderDirectMessageComments = asyncHandler(async (req, res, next) => {

  devLog(" getOlder "); 

  const directMessageId = req.params.id
  const oldestDirectMessageCommentId = req.params.oldestDirectMessageCommentId

  devLog("directMessageId: " + directMessageId); 
  devLog("oldestDirectMessageCommentId: " + oldestDirectMessageCommentId); 

  // first retreive the directmessagemember record for the member for this direct message and return error if none found
  const directmessagemember = await db.directmessagemembers.findOne({where: { memberId: req.member.id, directmessageId: directMessageId } })
  if( directmessagemember === null){ return next(new ErrorResponse('No directmessagemember record found', 401)); }

  // find the direct message 
  const directmessage = await db.directmessages.findOne({ where: { id: directMessageId } });
  if( directmessage === null){ return next(new ErrorResponse('No directmessage found', 401)); } 

          const dmComments = await db.directmessagecomments.findAll({
          where: {
            directmessageId: directMessageId,
            id: {     
              [Op.lt]:  oldestDirectMessageCommentId
          },
          },
          attributes:[['id','directMessageCommentId'], ['directmessagememberId','directMessageMemberId'],['directmessageId','directMessageId'],'comment', 'status', 'createdAt'],
          include: 
            [{
              model: db.directmessagemembers,
              as: 'directMessageMember', 
              attributes: [['id','directMessageMemberId']],
              include: [{
                model: db.members,
                as: 'member', 
                attributes: ['userName']  
                }]
            }],
            limit: 50,
            order: [['createdAt','DESC']]
        });  
 
        // it's okay to return null or empty array
        devLog("dmComments: " + JSON.stringify(dmComments))

        res.status(200).json({
        success: true,
        directMessageComments: dmComments
        });
  });

//  @desc   updateMemberWithDirectMessageID
//  @route  PUT /api/v1/directmessage/updatemember/:directMessageId
//  @access Private
exports.updateMemberWithDirectMessageId = asyncHandler(async (req, res, next) => {

  devLog(" updateMemberWithDirectMessageID "); 
  devLog("req.params.directMessageId: " + JSON.stringify(req.params.directMessageId)); 

  const directMessageId = parseInt(req.params.directMessageId);

  // update the member record with current directMessageId 
  req.member.set({currentDirectMessageId: directMessageId});
  const updatedMember = await req.member.save();
  if( updatedMember === null){ return next(new ErrorResponse('Member not updated', 401)); } 

  res.status(200).json({
    success: true,
    member: updatedMember
  });
});

//  @desc   addMemberToDirectMessage
//  @route  POST /api/v1/directmessage/addmember
//  @access Private
exports.addMemberToDirectMessage = asyncHandler(async (req, res, next) => {

  devLog(" addMemberToDirectMessage "); 
  devLog("req.body: " + JSON.stringify(req.body)); 

  const { 
    memberId, 
    directMessageId
    } = req.body;

    // check and get the direct message for updating
    const directMessage = await db.directmessages.findOne({ where: { id: directMessageId}});
    if( directMessage === null){ return next(new ErrorResponse('No direct message found', 401)); } 
      
    // check and get the member record of the new participant
    const member = await db.members.findOne({ where: { id: memberId }, 
      attributes: [['id','memberId'],['userName','userName']]
    });
    if( member === null){ return next(new ErrorResponse('No member found', 401)); } 
      
    // create the new direct message member record
      const dmMemberObject = {
        memberId: memberId,
        directmessageId: directMessageId,
        status: "active" 
           }

      const newdirectmessagemember = await db.directmessagemembers.create(dmMemberObject);
      if( newdirectmessagemember === null){ return next(new ErrorResponse('No direct message member created', 401)); } 

      devLog("directmessagemember: " + JSON.stringify(newdirectmessagemember))

      // updated participant string
      newParticipantString = directMessage.participantString + "," + member.userName;

      // update participant string
      directMessage.set({participantString: newParticipantString});

      // save direct message with updates
      const updatedDirectMessage = await directMessage.save();
      if( updatedDirectMessage === null){ return next(new ErrorResponse('Direct message not updated', 401)); } 

      // get the direct message member id for the requesting member to generate system message
        const directMessageMember = await db.directmessagemembers.findOne({
          where: {
            memberId: req.member.id, directmessageId: directMessage.id
          },
          attributes:['id','id'],
          include: 
          [{
            model: db.members,
            as: 'member', 
            attributes: [['id','memberId'],'userName']  
          }]
        });

        if( directMessageMember === null){ return next(new ErrorResponse('No direct message member found', 401)); } 

        devLog("directMessageMember: " + JSON.stringify(directMessageMember)); 

      // construct a system message informing others that somebody has been added
      let comment = "SYSTEM MESSAGE: " + member.userName + " has been added to this Direct Message by " + req.member.userName + "."
      const directMessageComment = await db.directmessagecomments.create({
        directmessagememberId: directMessageMember.id,
        directmessageId: directMessage.id,
        comment: comment,
        status: "visible"
      });

      const commentObject = {
        directMessageCommentId: directMessageComment.id,
        directMessageMemberId: directMessageComment.directmessagememberId,
        directMessageId: directMessageComment.directmessageId,
        comment: directMessageComment.comment,
        status: directMessageComment.status,
        createdAt: directMessageComment.createdAt,
        directMessageMember: {
          directMessageMemberId: directMessageComment.directmessagememberId,
          member: {
              userName: directMessageMember.member.userName
            }
          }
      }

  res.status(200).json({
    success: true,
    newDirectMessageMember: newdirectmessagemember,
    updatedDirectMessage: updatedDirectMessage,
    comment: commentObject
  });
});

//  @desc   Create Direct Message
//  @route  POST /api/v1/directmessage/
//  @access Private
exports.createDirectMessage = asyncHandler(async (req, res, next) => {
  devLog(" createDirectMessage "); 
  devLog("req.body: " + JSON.stringify(req.body)); 

    const { 
        title, 
        memberId,
        memberName
        } = req.body;

        const dmObject = {
            creatorId: req.member.id,
            title: title,
            participantString: "" + req.member.userName + "," + memberName,
        }

        const directmessage = await db.directmessages.create(dmObject);
        if( directmessage === null){ return next(new ErrorResponse('No direct message created', 401)); } 

        devLog("directmessage: " + JSON.stringify(directmessage)); 

        const dmMemberObject = {
            memberId: req.member.id,
            directmessageId: directmessage.id,  
            status: "active" 
               }

        const directmessagemember = await db.directmessagemembers.create(dmMemberObject);
        if( directmessagemember === null){ return next(new ErrorResponse('No direct message member created', 401)); } 

        devLog("directmessagemember: " + JSON.stringify(directmessagemember))

        const dmMemberObject2 = {
            memberId: memberId,
            directmessageId: directmessage.id,
            status: "active" 
               }

        const directmessagemember2 = await db.directmessagemembers.create(dmMemberObject2);
        if( directmessagemember2 === null){ return next(new ErrorResponse('No direct message member created', 401)); } 
        devLog("directmessagemember2: " + JSON.stringify(directmessagemember2))

    res.status(200).json({
      success: true,
      directMessage: directmessage,
      directMessageMember1: directmessagemember,
      directMessageMember2: directmessagemember2,
    });
  });

//  @desc   Create Direct Message Comment
//  @route  POST /api/v1/directmessage/createdmcomment
//  @access Private
exports.createDirectMessageComment = asyncHandler(async (req, res, next) => {

  devLog(" createDirectMessageComment ");
  devLog("req.body: " + JSON.stringify(req.body)); 

    const directMessageId = req.body.directMessageId
    const directMessageMemberId = req.body.directMessageMemberId
    const comment = req.body.comment

    // like checking to make sure req.member matches directMessageMemberId??
  
    const directMessageComment = await db.directmessagecomments.create({
        directmessagememberId: directMessageMemberId,
        directmessageId: directMessageId,
        comment: comment,
        status: "visible"
    });

    // get member info to return with new comment
    const directMessageMember = await db.directmessagemembers.findOne({
      where: {
        id: directMessageComment.directmessagememberId
      },
      attributes:['directmessageId', ['id','directMessageMemberId']],
      include: 
      [{
        model: db.members,
        as: 'member', 
        attributes: [['id','memberId'],'userName']  
      }]
    });

    devLog("directMessageMember: " + JSON.stringify(directMessageMember)); 

    const commentObject = {
      directMessageCommentId: directMessageComment.id,
      directMessageMemberId: directMessageComment.directmessagememberId,
      directMessageId: directMessageComment.directmessageId,
      comment: directMessageComment.comment,
      status: directMessageComment.status,
      createdAt: directMessageComment.createdAt,
      directMessageMember: {
        directMessageMemberId: directMessageComment.directmessagememberId,
        member: {
            userName: directMessageMember.member.userName
          }
        }
    }

      res.status(200).json({
        success: true,
        comment: commentObject,
      });
  });

//  @desc   Get Direct Message Headers 
//  @route  GET /api/v1/directmessage/getdirectmessageheaders
//  @access Private
exports.getDirectMessageHeaders = asyncHandler(async (req, res, next) => {
        devLog(" getDirectMessageHeaders ");
        devLog("req.member.id: " + JSON.stringify(req.member.id)); 
        
        const dmHeaders = await db.directmessages.findAll({
          where: {
            '$directmessagemembers.memberId$': req.member.id
          },
          attributes:[['id','directMessageId'], 'creatorId', 'title', 'participantString','lastMessageDate','status'],
          include: 
            [{
              model: db.directmessagemembers,
              as: 'directmessagemembers', 
              attributes: [['id','directMessageMemberId'],['status','dmMemberStatus']]  
            }]
        });

        // it's okay to return null or empty array
        devLog("dmHeaders: " + JSON.stringify(dmHeaders))

    res.status(200).json({
      success: true,
      directMessageHeaders: dmHeaders
    });
  });

//  @desc   Get Direct Message Comments
//  @route  GET /api/v1/directmessage/getdirectmessagecomments/:id
//  @access Private
exports.getDirectMessageComments = asyncHandler(async (req, res, next) => {

    devLog(" getDirectMessageComments ");
    const directMessageId = parseInt(req.params.id)

        devLog("directMessageId: " + directMessageId); 
 
        const dmComments = await db.directmessagecomments.findAll({
          where: {
            directmessageId: directMessageId
          },
          attributes:[['id','directMessageCommentId'], ['directmessagememberId','directMessageMemberId'],['directmessageId','directMessageId'],'comment', 'status', 'createdAt'],
          include: 
            [{
              model: db.directmessagemembers,
              as: 'directMessageMember', 
              attributes: [['id','directMessageMemberId']],
              include: [{
                model: db.members,
                as: 'member', 
                attributes: ['userName']  
                }]
            }],
            limit: 50,
            order: [['createdAt','DESC']]
        });       

        // it's okay to return null or empty array
        devLog("dmComments: " + JSON.stringify(dmComments))

    res.status(200).json({
        success: true,
        directMessageComments: dmComments
        });
  });