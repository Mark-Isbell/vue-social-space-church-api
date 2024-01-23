const asyncHandler = require("../middleware/async");
const { Sequelize, Model } = require('sequelize');
const ErrorResponse = require("../utils/ErrorResponse");
const db = require("../models");

/*
the purpose of this util file is to 'link' a member account with a church stream
only used during initial member registration
*/

const linkChurchStream = async (memberRecord) => {
    
  // now retreive the default church stream
  const stream = await db.streams.findOne({ where: { 
    type: "church"
  }, attributes: ['id', 'name','status', 'type']});

  if( stream === null){ return next(new ErrorResponse('No church stream found', 401)); } 

  // first check if the member is already in the stream 
  let streammember = {};

  const streamMemberExisting = await db.streammembers.findOne({ where: { 
    memberId: memberRecord.id,
    streamId: stream.id
  }, attributes: ['id', 'participantType']});

  // if no existing streammember record found, then create one
  if (streamMemberExisting === null) {
    streammember = await db.streammembers.create({
      memberId: memberRecord.id,
      streamId: stream.id,
      participantType: "member",
      status: "normal"
    });

    if( streammember === null){ return next(new ErrorResponse('Church stream membership not created', 401)); } 

  } else {
    streammember.participantType = streamMemberExisting.participantType;
    streammember.id = streamMemberExisting.id;
  }
      const streamInfo = {
          streamName: stream.name,
          streamStatus: stream.status,
          streamType: stream.type,
          streamMemberRole: streammember.participantType,
          commentKey: {
            streamId: stream.id,
            streamMemberId: streammember.id,
          }
        }

            return streamInfo;
    };
  
  module.exports = linkChurchStream;
  









