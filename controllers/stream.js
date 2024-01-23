const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/async");
const { Op,Sequelize, Model } = require('sequelize');
const db = require("../models");
const devLog = require("../utils/devLog");

//  @desc   Get comments for a stream
//  @route  GET /api/v1/stream/:id/replace
//  @access Private
exports.replace = asyncHandler(async (req, res, next) => {

  devLog(" replace "); 

  const streamId = req.params.id

  devLog("streamId: " + streamId); 

  // first retreive the streammember record for the member for this stream and return error if none found
  const streammember = await db.streammembers.findOne({where: { memberId: req.member.id, streamId: streamId } })
  if( streammember === null){ return next(new ErrorResponse('No streammember record found', 401)); }

  // find the stream 
  const stream = await db.streams.findOne({ where: { id: streamId } });
  if( stream === null){ return next(new ErrorResponse('No stream found', 401)); } 

  const comments = await db.streamcomments.findAll({
    where: {
      streamId: stream.id
    },
    attributes:[['id','commentId'],'comment', 'status', 'likesNumber','praisesNumber','likes','praises','createdAt'],
    include: 
    [{
      model: db.streammembers,
      as: 'streammember', 
      attributes: [['id','streamMemberId']] ,
      include: [{
        model: db.members,
        as: 'member', 
        attributes: [['id','memberId'],'userName']   
      }]
    }],
    order: [['createdAt','DESC']],
    limit: 50
  });

  // devLog("comments: " + JSON.stringify(comments)); 

    const commentsObject = {

      streamHeaderInfo: {
          streamId: stream.id,
          streamName: stream.name,
          streamStatus: stream.status,
          streamType: stream.type,
          participantType: streammember.participantType,
          streamMemberId: streammember.id,
        },
        commentsReturnedCount: comments.length,
        streamComments: comments
    }

    res.status(200).json({
      success: true,
      updateOrReplace: "replace",
      comments: commentsObject,
    });
  });

//  @desc   Get comments: decision to update or replace existing comments
//  @route  GET /api/v1/stream/:id/updateorreplace/:commentId
//  @access Private
exports.updateOrReplace = asyncHandler(async (req, res, next) => {
  
      devLog(" updateOrReplace "); 

      const streamId = req.params.id
      const commentId = req.params.commentId

      let updateOrReplace = "replace"; 

      // first retreive the streammember record for the member for this stream and return error if none found
      const streammember = await db.streammembers.findOne({where: { memberId: req.member.id, streamId: streamId } })
      if( streammember === null){ return next(new ErrorResponse('No streammember record found', 401)); }

      const stream = await db.streams.findOne({ where: { id: streamId }, });
      if( stream === null){ return next(new ErrorResponse('No stream found', 401)); } 

      const latestComment = await db.streamcomments.findOne({ where: { id: commentId }, });

      // latest comment could be null if it was deleted 
      devLog("latestComment: " + JSON.stringify(latestComment))

      if(latestComment !== null) {
        devLog("latestComment.streamId: " + JSON.stringify(latestComment.streamId))
      }
      devLog("streamId: " + JSON.stringify(streamId))

      // get most recent 50 records and search for the comment ID. If located then splice out.
      const comments = await db.streamcomments.findAll({
      where: {
        streamId: stream.id
      },
      attributes:['id',['id','commentId'],'comment', 'status', 'likesNumber','praisesNumber','likes','praises','createdAt'],
      include: 
      [{
        model: db.streammembers,
        as: 'streammember', 
        attributes: [['id','streamMemberId']] ,
        include: [{
          model: db.members,
          as: 'member', 
          attributes: [['id','memberId'],'userName']   
        }]
      }],
      order: [['createdAt','DESC']],
      limit: 50
    });

    // now see if latest comment is in list
    let commentsReturned = [];
   
    for (let i=0;i<comments.length;i++) { 
        if (latestComment !== null && comments[i].id === latestComment.id) {
        updateOrReplace = "update";
        break;
        } else {
          commentsReturned.push(comments[i])
        }
    }

    const commentsObject = {
      
      streamHeaderInfo: {
          streamId: stream.id,
          streamName: stream.name,
          streamStatus: stream.status,
          streamType: stream.type,
          participantType: streammember.participantType,
          streamMemberId: streammember.id,
        },
        commentsReturnedCount: commentsReturned.length,
        streamComments: commentsReturned
    }

    res.status(200).json({
      success: true,
      updateOrReplace: updateOrReplace,
      comments: commentsObject,
    });
});


//  @desc   Get older posts for a stream
//  @route  GET /api/v1/stream/:id/:oldestStreamCommentId/older
//  @access Private
exports.getOlder = asyncHandler(async (req, res, next) => {

  devLog(" getOlder "); 

  const streamId = req.params.id
  const oldestStreamCommentId = req.params.oldestStreamCommentId

  devLog("streamId: " + streamId); 
  devLog("oldestStreamCommentId: " + oldestStreamCommentId); 

  // first retreive the streammember record for the member for this stream and return error if none found
  const streammember = await db.streammembers.findOne({where: { memberId: req.member.id, streamId: streamId } })
  if( streammember === null){ return next(new ErrorResponse('No streammember record found', 401)); }

  // find the stream 
  const stream = await db.streams.findOne({ where: { id: streamId } });
  if( stream === null){ return next(new ErrorResponse('No stream found', 401)); } 

  const comments = await db.streamcomments.findAll({
    where: {
      streamId: streamId,
      id: {     
        [Op.lt]:  oldestStreamCommentId
    },
    },
    attributes:['id',['id','commentId'],'comment', 'status', 'likesNumber','praisesNumber','likes','praises','createdAt'],
    include: 
    [{
      model: db.streammembers,
      as: 'streammember', 
      attributes: [['id','streamMemberId']] ,
      include: [{
        model: db.members,
        as: 'member', 
        attributes: [['id','memberId'],'userName']   
      }]
    }],
    order: [['createdAt', 'DESC']],
    limit: 50
  });

  // devLog("comments: " + JSON.stringify(comments)); 

    const commentsObject = {

      streamHeaderInfo: {
          streamId: stream.id,
          streamName: stream.name,
          streamStatus: stream.status,
          streamType: stream.type,
          participantType: streammember.participantType,
          streamMemberId: streammember.id,
        },
        commentsReturnedCount: comments.length,
        streamComments: comments
    }

    res.status(200).json({
      success: true,
      comments: commentsObject,
    });
  });

//  @desc   Post comment for a stream
//  @route  POST /api/v1/stream/comment
//  @access Private
exports.postComment = asyncHandler(async (req, res, next) => {

  devLog(" postComment "); 

  const streamId = req.body.streamId;
  const streamMemberId = req.body.streamMemberId;
  const comment = req.body.comment;

  // check for restricted status - front end prevents but adding check here as well
  const streamMemberRecord = await db.streammembers.findOne({ where: { id: streamMemberId },
    attributes: [
    ['status','status']
  ]
   });
   devLog("streamMemberRecord: " + JSON.stringify(streamMemberRecord));
  if( streamMemberRecord === null){ return next(new ErrorResponse('No streammember record found in postComment controller', 401)); } 
  if(streamMemberRecord.status === "restricted") {
    return next(new ErrorResponse('Member is restricted from posting comments in this stream.', 401));
  }

  const streamComment = await db.streamcomments.create({
    streammemberId: streamMemberId,
    streamId: streamId,
    comment: comment,
    status: "visible"
  });

  const commentObject = {
    commentId: streamComment.id,
    comment: streamComment.comment,
    status: streamComment.status,
    likesNumber: streamComment.likesNumber,
    praisesNumber: streamComment.praisesNumber,
    likes: streamComment.likes,
    praises: streamComment.praises,
    createdAt: streamComment.createdAt,
    streammember: {
      streamMemberId: streamMemberId,
      member: {
        memberId: req.member.id,
        userName: req.member.userName
      }
    }
  }

  devLog("commentObject: " + JSON.stringify(commentObject)); 

    res.status(200).json({
      success: true,
      comments: commentObject,
    });
  });

//  @desc   Edit comment for a stream
//  @route  PUT /api/v1/stream/comment
//  @access Private
exports.editComment = asyncHandler(async (req, res, next) => {

  devLog(" editComment "); 

  const commentId = req.body.commentId;
  const comment = req.body.comment;
  const status = req.body.status; 

  const targetComment = await db.streamcomments.findOne({ where: { id: commentId },
    attributes: [
    'id',
    'streammemberId',
    'comment',
    'status'
  ]
   });
  if( targetComment === null){ return next(new ErrorResponse('No comment found in editComment controller', 401)); } 
  devLog("targetComment: " + JSON.stringify(targetComment));

  // validate it belongs to member before updating
  const streamMember = await db.streammembers.findOne({ where: { id: targetComment.streammemberId, memberId: req.member.id }});
  if( streamMember === null){ return next(new ErrorResponse('No matching streammember found in editComment controller', 401)); } 

  targetComment.set({
    comment: comment,
    status: status
  });

  const updatedComment = await targetComment.save();

  devLog("updatedComment: " + JSON.stringify(updatedComment));

    res.status(200).json({
      success: true,
      comment: updatedComment,
    });
  });

//  @desc   Delete comment for a stream
//  @route  DELETE /api/v1/stream/comment/:commentId
//  @access Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
  
  devLog(" deleteComment "); 

  const commentId = parseInt(req.params.commentId)

  devLog("commentId: " + JSON.stringify(commentId))

  const deleteResult = await db.streamcomments.destroy({
      where: {
          id: commentId
      }
  })

  devLog("deleteResult: " + JSON.stringify(deleteResult))  

    res.status(200).json({
      success: true,
      deleteResult: deleteResult,
    });
  });

//  @desc   update reaction to comment
//  @route  PUT /api/v1/stream/comment/reaction
//  @access Private
exports.updateReaction = asyncHandler(async (req, res, next) => {

  devLog(" updateReaction "); 

  const { streamId, commentId, reactionType, action } = req.body;

  // check stream ID first
  const stream = await db.streams.findOne({ where: { id: streamId}});
  if( stream === null){ return next(new ErrorResponse('No stream found', 401)); } 

  // now get the comment
  const comment = await db.streamcomments.findOne({ where: { id: commentId}});
  if( comment === null){ return next(new ErrorResponse('No comment found', 401)); } 

  // set aside original values 
  let originalLikesValue = comment.likes;
  let originalPraisesValue = comment.praises;
  let originalLikesNumber = comment.likesNumber;
  let originalPraisesNumber = comment.praisesNumber;

  // instantiate new values 
  let newLikesValue = "";
  let newPraisesValue = "";
  let newLikesNumber = 0;
  let newPraisesNumber = 0;

  // values for individual like or praise strings
  let likeString = "";
  let praiseString = "";

  // "add to totals" variables
  let likesAdd = 0;
  let praisesAdd = 0;

  // set non-updated values for new to equal original (no change)
  if(reactionType==="like") {
    newPraisesNumber = originalPraisesNumber;
    newPraisesValue = originalPraisesValue;
  } else 
  {
    newLikesNumber = originalLikesNumber;
    newLikesValue = originalLikesValue;
  }

  // edit the new totals for likes and praises
  if(action==="remove") {
    if(reactionType === "like")
      {
      likesAdd = -1;
      newLikesNumber = originalLikesNumber + likesAdd;
      likeString = ",userId" + req.member.id; // used for removal later
      }
      else
      {
      praisesAdd = -1;
      praiseString = ",userId" + req.member.id; // used for removal later
      newPraisesNumber = originalPraisesNumber + praisesAdd;
      }
  }
  else if(action==="add") { 
    if(reactionType === "like")
      {
        likesAdd = 1;
        likeString = ",userId" + req.member.id + "userName" + req.member.userName; // used for removal later
        newLikesNumber = originalLikesNumber + likesAdd;
      }
      else 
      {
        praisesAdd = 1;
        praiseString = ",userId" + req.member.id + "userName" + req.member.userName; // used for removal later
        newPraisesNumber = originalPraisesNumber + praisesAdd;
      }
  }

  // edit likes and praises text string
  if(action==="remove"){
        if(reactionType === "praise")
        {
          let endIndex = 0;
          let beginIndex = comment.praises.indexOf(praiseString);
          let nextCommaIndex = comment.praises.indexOf(',', (beginIndex+1));
          if(nextCommaIndex === -1) {
                endIndex = comment.praises.length;
              } else {
                endIndex = nextCommaIndex; 
              }
              newPraisesValue = originalPraisesValue.replace(originalPraisesValue.substring(beginIndex, endIndex),"")
        }
        else 
        {
          let endIndex = 0;
          let beginIndex = comment.likes.indexOf(likeString);
          let nextCommaIndex = comment.likes.indexOf(',', (beginIndex+1));
          if(nextCommaIndex === -1) {
                endIndex = comment.likes.length;
              } else {
                endIndex = nextCommaIndex; 
              }
          newLikesValue = originalLikesValue.replace(originalLikesValue.substring(beginIndex, endIndex),"")
        }
    }
    if (action==="add"){
      if(reactionType==="like")
      {
        newLikesValue = originalLikesValue + likeString;
      }
      else
      {
        newPraisesValue = originalPraisesValue + praiseString;
      }
    }

  comment.set({
    likesNumber: newLikesNumber,
    praisesNumber: newPraisesNumber,
    likes: newLikesValue,
    praises: newPraisesValue
  });

  const updatedComment = await comment.save();

  devLog("updatedComment: " + JSON.stringify(updatedComment));

  res.status(200).json({
    success: true,
    comment: updatedComment,
  });
})

//  @desc   Create new stream for a church
//  @route  POST /api/v1/stream/create
//  @access Private
exports.createStream = asyncHandler(async (req, res, next) => {

  devLog(" createStream "); 

  const streamName = req.body.streamName
  const streamType = req.body.streamType
  const streamDescription = req.body.streamDescription

  const stream = await db.streams.create({
    name: streamName,
    status: "active",
    type: streamType,
    description: streamDescription
  });

  if(stream === null){ return next(new ErrorResponse('No stream created', 401)); }

  // create the moderator's streammember record
  const streammember = await db.streammembers.create({
    memberId: req.member.id,
    streamId: stream.id,
    participantType: "moderator",
    status: "normal"
  });

  if(streammember === null){ return next(new ErrorResponse('No streammember created', 401)); }

  // build and return the stream comment object without any comments
  const commentsObject = {
    streamHeader: {
        streamId: stream.id,
        streamName: stream.name,
        streamStatus: stream.status,
        streamType: stream.type,
        participantType: streammember.participantType,
        streamMemberId: streammember.id
      },
      commentsReturnedCount: 0,
      streamComments: []
  }

    res.status(200).json({
      success: true,
      comments: commentsObject,
    });
  });

//  @desc   Update a stream for a church
//  @route  PUT /api/v1/stream/update
//  @access Private
exports.updateStream = asyncHandler(async (req, res, next) => {

  devLog(" updateStream "); 

  const { streamId, name, status, description } = req.body;

  const stream = await db.streams.findOne({ where: { id: streamId }, });
  if( stream === null){ return next(new ErrorResponse('No stream found', 401)); } 

  stream.set({
    name: name,
    status: status,
    description: description
  });

  const updatedStream = await stream.save();

    res.status(200).json({
      success: true,
      comments: updatedStream,
    });
  });


//  @desc   Get members for a stream in alpha order for left nav with limits
//  @route  GET /api/v1/stream/:id/members
//  @access Private
exports.getStreamMembers = asyncHandler(async (req, res, next) => {

  devLog(" getStreamMembers "); 

  const streamId = req.params.id
  devLog("streamId: " + JSON.stringify(streamId)); 

  const streamMembers = await db.streammembers.findAll({
    where: {
      streamId: streamId
    },
    attributes:['streamId', ['id','streamMemberId']],
    include: 
    [{
      model: db.members,
      as: 'member', 
      attributes: [['id','memberId'],'userName','role','createdAt']  
    }]
  });

  // devLog("streamMembers: " + JSON.stringify(streamMembers)); 

    res.status(200).json({
      success: true, 
      streamMembers: streamMembers,
    });
  });

//  @desc   Get information about a stream based on Stream Id
//  @route  GET /api/v1/stream/information/:id
//  @access Private
exports.getStreamInformation = asyncHandler(async (req, res, next) => {

  devLog(" getStreamInformation "); 

  const streamId = req.params.id
  devLog("streamId: " + JSON.stringify(streamId))

  const stream = await db.streams.findOne({ where: { id: streamId }, });
  if( stream === null){ return next(new ErrorResponse('No stream found', 401)); } 

    res.status(200).json({
      success: true, 
      streamInformation: stream,
    });
  });

//  @desc   Get one member and their streams by member name
//  @route  GET /api/v1/stream/streams/member/:memberName
//  @access Private
exports.getMemberStreams = asyncHandler(async (req, res, next) => {

  devLog(" getMemberStreams "); 

  const memberName = req.params.memberName
  devLog("memberName: " + JSON.stringify(memberName));

  const streamMembers = await db.streammembers.findAll({
    where: {
      '$member.userName$': memberName
    },
    attributes:[['id','streamMemberId'],'streamId', ['status','streamMemberStatus']],
    include: 
    [{
      model: db.members,
      as: 'member', 
      attributes: [['id','memberId'],'userName','role']  
    }]
  });

  devLog("streamMembers: " + JSON.stringify(streamMembers));

    res.status(200).json({
      success: true, 
      streamMemberRecords: streamMembers,
    });
  });

//  @desc   Get stream headers and header keys
//  @route  GET /api/v1/stream/headers
//  @access Private
exports.getStreamHeaders = asyncHandler(async (req, res, next) => {

  devLog(" getStreamHeaders "); 

  const headers = await db.streams.findAll({ 
    attributes: [['id','streamId'],['name','streamName'],['status','streamStatus'],['type','streamType'],['description','streamDescription']]
  })

  devLog("headers: " + JSON.stringify(headers))

    const headerKeys = await db.streams.findAll({
      where: {
        '$streammembers.memberId$': req.member.id
      },
      attributes:[['id','streamId']],
      include: 
        [{
          model: db.streammembers,
          as: 'streammembers', 
          attributes: ['participantType','status',['id','streamMemberId']]  
        }]
    });

  devLog("headerKeys: " + JSON.stringify(headerKeys))

    res.status(200).json({
      success: true,
      streamHeaders: headers,
      streamHeaderKeys: headerKeys
    });
  });

//  @desc   Request to join stream
//  @route  POST /api/v1/stream/request
//  @access Private
exports.requestJoin = asyncHandler(async (req, res, next) => {

  devLog(" requestJoin "); 

  const { message, KeyFieldStreamId } = req.body;
 
  const moderatormessage = await db.moderatormessages.create({
    type: "streamjoinrequest",
    message: message,
    status: "pending",
    keyfieldmemberId: req.member.id,
    keyfieldstreamId: KeyFieldStreamId
  });

  if(moderatormessage === null){ return next(new ErrorResponse('No moderator join request message created', 401)); }
  
  devLog("moderatormessage: " + JSON.stringify(moderatormessage))

      res.status(200).json({
      success: true,
      moderatorMessage: moderatormessage
    });
  });


//  @desc   Get all requests to join a specific stream for member
//  @route  GET /api/v1/stream/requests/:id
//  @access Private
exports.getExistingJoinRequests = asyncHandler(async (req, res, next) => {

  devLog(" getExistingJoinRequests "); 

  const KeyFieldStreamId = parseInt(req.params.id)
 
  const allStreamRequests = await db.moderatormessages.findAll({ where: { 
    keyfieldmemberId: req.member.id,
    keyfieldstreamId: KeyFieldStreamId
    },
    attributes: [
    ['keyfieldmemberId','memberId'],
    ['keyfieldstreamId','streamId'],
    ['type','type'],
    ['message','message'],
    ['status','requestStatus'],
    ['createdAt','createdAt']]
  })

  // null is okay to return 
  devLog("allStreamRequests: " + JSON.stringify(allStreamRequests)); 

      res.status(200).json({
      success: true,
      streamRequests: allStreamRequests
    });
  });