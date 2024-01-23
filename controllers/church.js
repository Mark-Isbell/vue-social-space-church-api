const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/async");
const { Op, Sequelize, Model } = require('sequelize');
const db = require("../models");
const devLog = require("../utils/devLog");

//  @desc   Get all church members
//  @route  GET /api/v1/church/members/:limit/:offset
//  @access Private
exports.getAllChurchMembers = asyncHandler(async (req, res, next) => {
  devLog(" getAllChurchMembers "); 

  const limit = req.params.limit;
  const offset = req.params.offset;

  devLog(" limit: " + limit);
  devLog(" offset: " + offset);

  const members = await db.members.findAll({ where: { 
    isEmailConfirmed: "yes"
  },
    attributes: [['id','memberId'],['userName','userName'],['createdAt','createdAt'],['role','role']],
    limit: limit,
    offset: offset,
    order: ['userName']
  })

  devLog("members is: " + JSON.stringify(members))

    res.status(200).json({
      success: true,
      churchMembers: members,
    });
  });

//  @desc   Get individual church member
//  @route  GET /api/v1/church/member/:id
//  @access Private
exports.getChurchMember = asyncHandler(async (req, res, next) => {
  devLog(" getChurchMember "); 
  const memberId = req.params.id;

  const member = await db.members.findOne({ where: { id: memberId },
    attributes: [
    ['id','id'],
    ['userName','userName'],
    ['email','email'],
    ['role','role'],
    ['profilePic','profilePic'],
    ['introduction','introduction'],
    ['createdAt','createdAt']
  ]
   });

  if( member === null){ return next(new ErrorResponse('No member found in getChurchMember controller', 401)); } 

  const facts = await db.memberfacts.findAll({ where: { 
    memberId: memberId
  },
    attributes: [['id', 'id'],['memberId','memberId'],['description','description'],['fact','fact'],['createdAt','createdAt']],
    limit: 300,
    order: ['createdAt']
  })

  // facts can be null so no check

      res.status(200).json({
        success: true,
        churchMember: member,
        churchMemberFacts: facts
      });
  });

//  @desc   Get individual church member by user name
//  @route  GET /api/v1/church/member/name/:username
//  @access Private
exports.getChurchMemberByName = asyncHandler(async (req, res, next) => {
  devLog(" getChurchMemberByName "); 
  const userName = req.params.username;

  const member = await db.members.findOne({ where: { userName: userName},
    attributes: [
    ['id','id'],
    ['userName','userName'],
    ['role','role'],
  ]
   });

devLog(" member: " + JSON.stringify(member))

  if( member === null){ 
  } 

      res.status(200).json({
        success: true,
        churchMember: member
      });
  });

//  @desc   Get a member's church info
//  @route  GET /api/v1/church/member
//  @access Private
exports.getChurch = asyncHandler(async (req, res, next) => {

    devLog("getChurch"); 
    const church = await db.churches.findOne();
    if( church === null){ return next(new ErrorResponse('No church found', 401)); } 
  
      res.status(200).json({
        success: true,
        church: church,
      });
    });

//  @desc   Get a church name by invite code
//  @route  GET /api/v1/church/invitecode/:code
//  @access Private
exports.getChurchByInviteCode = asyncHandler(async (req, res, next) => {
  devLog("getChurchByInviteCode"); 
  const inviteCode = req.params.code

  devLog("req.params.code: " + JSON.stringify(req.params.code)); 

  const churchName = await db.churches.findOne({ where: { invitationCode: inviteCode }, 
    attributes: ['name']});
  if( churchName === null){ return next(new ErrorResponse('No church found', 401)); } 

    res.status(200).json({
      success: true,
      churchName: churchName,
    });
  });
    
//  @desc   Update an individual church
//  @route  PUT /api/v1/church/update
//  @access Private
exports.updateChurch = asyncHandler(async (req, res, next) => {
    devLog("updateChurch"); 
    devLog("req.body: " + JSON.stringify(req.body)); 

    const { name, country,  street1, street2, city, state, zip, intStateProvinceRegion, intZipPostal} = req.body;

    const church = await db.churches.findOne();

    if( church === null){ return next(new ErrorResponse('No church found', 401)); } 
  
    church.set({
      name: name,
      country: country,
      street1: street1,
      street2: street2,
      city: city,
      state: state,
      zip: zip,
      intStateProvinceRegion: intStateProvinceRegion,
      intZipPostal: intZipPostal 
    });

    const updatedChurch = await church.save();

    devLog("updatedChurch: " + JSON.stringify(updatedChurch));
    if( updatedChurch === null){ return next(new ErrorResponse('Church not updated', 401)); } 
   
      res.status(200).json({
        success: true,
        church: updatedChurch,
      });
    });

//  @desc   Generate new church invitation code
//  @route  GET /api/v1/church/generatenewinvitecode
//  @access Private
exports.generateNewInviteCode = asyncHandler(async (req, res, next) => {
  devLog("generateNewInviteCode"); 

  const church = await db.churches.findOne();

  if( church === null){ return next(new ErrorResponse('No church found', 401)); } 

  const inviteCode = getInviteCode();
  devLog("inviteCode: " + inviteCode);

  church.set({
    invitationCode: inviteCode
  });

  const updatedChurch = await church.save();

  devLog("updatedChurch: " + JSON.stringify(updatedChurch));
  if( updatedChurch === null){ return next(new ErrorResponse('Church not updated', 401)); } 
 
    res.status(200).json({
      success: true,
      church: updatedChurch,
    });
  });

//  @desc   Update an individual church moderation policy
//  @route  PUT /api/v1/church/updatemoderationpolicy
//  @access Private
exports.updateModerationPolicy = asyncHandler(async (req, res, next) => {
  devLog("updateModerationPolicy"); 
  devLog("req.body: " + JSON.stringify(req.body)); 

  const { moderationPolicy} = req.body;

  const church = await db.churches.findOne();

  if( church === null){ return next(new ErrorResponse('No church found', 401)); } 

  church.set({
    moderationPolicy: moderationPolicy 
  });

  const updatedChurch = await church.save();

  devLog("updatedChurch: " + JSON.stringify(updatedChurch));
  if( updatedChurch === null){ return next(new ErrorResponse('Church not updated', 401)); } 
 
    res.status(200).json({
      success: true,
      church: updatedChurch,
    });
  });

//  @desc   Get Church Links
//  @route  GET /api/v1/church/link
//  @access Private
exports.getChurchLinks = asyncHandler(async (req, res, next) => {
  devLog("getChurchLinks"); 

  const links = await db.churchlinks.findAll({ 
    attributes: [['id','id'],['description','description'],['link','link'],['createdAt','createdAt']],
    limit: 300,
    order: ['createdAt']
  })

    res.status(200).json({
      success: true,
      links: links
    });
  });

//  @desc   Edit Church Link
//  @route  PUT /api/v1/church/link/update
//  @access Private
exports.editChurchLink = asyncHandler(async (req, res, next) => {
  devLog("editChurchLink"); 

  const {linkId, updatedDescription, updatedValue } = req.body;

  devLog(" linkId: " + JSON.stringify(linkId) + 
  "updatedDescription: " + JSON.stringify(updatedDescription) + "updatedValue: " + JSON.stringify(updatedValue));

  const link = await db.churchlinks.findOne({ where: { id: linkId}});

  if( link === null){ return next(new ErrorResponse('No link found', 401)); } 

    // update and save church link
    link.set({
      description: updatedDescription,
      link: updatedValue
    });
  
    const updatedLink = await link.save();

    devLog("updatedLink: " + JSON.stringify(updatedLink))

    res.status(200).json({
      success: true,
      updatedLink: updatedLink
    });
  });

//  @desc   Delete Church Link
//  @route  DEL /api/v1/church/link/:linkId
//  @access Private
exports.deleteChurchLink = asyncHandler(async (req, res, next) => {
  devLog("deleteChurchLink"); 

  const linkId = parseInt(req.params.linkId)

  devLog("linkid: " + JSON.stringify(linkId))

  const deleteResult = await db.churchlinks.destroy({
      where: {
          id: linkId
      }
  })

  devLog(" deleteResult: " + JSON.stringify(deleteResult))

    res.status(200).json({
      success: true,
      deleteResult: deleteResult
    });
  });

//  @desc   Create a Church Link
//  @route  POST /api/v1/church/link
//  @access Private
exports.createChurchLink = asyncHandler(async (req, res, next) => {
  devLog("createChurchLink"); 
  devLog("req.body: " + JSON.stringify(req.body)); 
  const {description, value } = req.body;

  const link = await db.churchlinks.create({
    description: description,
    link: value
});

if( link === null){ 
  return next(new ErrorResponse('Error: link not created', 401)); 
} 

    res.status(200).json({
      success: true,
      link: link
    });
  });

//  @desc   Create a calendar event
//  @route  POST /api/v1/event
//  @access Private
exports.createEvent = asyncHandler(async (req, res, next) => {

    const { title, description, beginDateTime, endDateTime, location, link } = req.body;

    const event = await db.calendarevents.create({
      title: title,
      description: description, 
      beginDateTime: beginDateTime,
      endDateTime: endDateTime,
      location: location,
      link: link
    });

    if( event === null){ 
      return next(new ErrorResponse('Error: Event not created', 401)); 
    } 
  
    devLog("event: " + JSON.stringify(event)); 
  
      res.status(200).json({
        success: true,
        event: event
      });
  });

//  @desc   Get Event
//  @route  GET /api/v1/church/event/:eventId
//  @access Private
exports.getEvent = asyncHandler(async (req, res, next) => {
  devLog("getEvent"); 

  const eventId = parseInt(req.params.linkId); 

  const event = await db.calendarevents.findOne({ where: { id: eventId }});

  if( event === null){ return next(new ErrorResponse('No event found', 401)); } 

    res.status(200).json({
      success: true,
      event: event
    });
  });

//  @desc   Get Events
//  @route  GET /api/v1/church/events/:beginMonth/:beginDay/:beginYear/:endMonth/:endDay/:endYear
//  @access Private
exports.getEvents = asyncHandler(async (req, res, next) => {
  devLog("getEvents"); 

  const beginMonth = parseInt(req.params.beginMonth); 
  const beginDay = parseInt(req.params.beginDay); 
  const beginYear = parseInt(req.params.beginYear); 
  const endMonth = parseInt(req.params.endMonth); 
  const endDay = parseInt(req.params.endDay); 
  const endYear = parseInt(req.params.endYear); 

  /*
  devLog("beginMonth: " + beginMonth);
  devLog("beginDay: " + beginDay);
  devLog("beginYear: " + beginYear);
  devLog("endMonth: " + endMonth);
  devLog("endDay: " + endDay);
  devLog("endYear: " + endYear);
  */

  // first construct begin and end date parameters based on month number 

  const beginDate = "" + beginYear + "-" + beginMonth + "-" + beginDay;
  const endDate = "" + endYear + "-" + endMonth + "-" + endDay;

  devLog("beginDate and endDate: " + JSON.stringify(beginDate) + " and " + JSON.stringify(endDate));
 
    let beginDate1 = new Date(Date.parse(beginDate)); 
    let endDate1 = new Date(Date.parse(endDate)); 

    // slightly wider net for month-end edge case events
    let beginDate2 = new Date(beginDate1.setDate(beginDate1.getDate() - 1));
    let endDate2 = new Date(endDate1.setDate(endDate1.getDate() + 1));

  const events = await db.calendarevents.findAll({ where: { 
    'endDateTime': {     
        [Op.gte]:  beginDate2
    },
    'beginDateTime': {     
      [Op.lte]:  endDate2
  },
  },
    order: ['beginDateTime']
  })
  
  devLog("events: " + JSON.stringify(events)); 

    res.status(200).json({
      success: true,
      events: events
    });
  });

//  @desc   Delete Event
//  @route  DEL /api/v1/church/event/:eventId
//  @access Private
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  devLog("deleteEvent"); 

  const eventId = parseInt(req.params.eventId)

  devLog("eventId: " + JSON.stringify(eventId))

  const deleteResult = await db.calendarevents.destroy({
      where: {
          id: eventId
      }
  })

  devLog("deleteResult: " + JSON.stringify(deleteResult))

    res.status(200).json({
      success: true,
      deleteResult: deleteResult
    });
  });

//  @desc   Edit Event
//  @route  PUT /api/v1/church/event/update
//  @access Private
exports.editEvent = asyncHandler(async (req, res, next) => {
  devLog("editEvent")

  const {eventId, title, description, beginDateTime, endDateTime, location, link } = req.body;

  devLog("req.body: " + JSON.stringify(req.body)); 

  const event = await db.calendarevents.findOne({ where: { id: eventId }});

  if( event === null){ return next(new ErrorResponse('No event found', 401)); } 

    // update and save event
    event.set({
      title: title,
      description: description, 
      beginDateTime: beginDateTime,
      endDateTime: endDateTime,
      location: location,
      link: link
    });
  
    const updatedEvent = await event.save();

    devLog("updatedEvent: " + JSON.stringify(updatedEvent))

    res.status(200).json({
      success: true,
      updatedEvent: updatedEvent
    });
  });

//  @desc   Create Church Fact
//  @route  POST /api/v1/church/fact
//  @access Private
exports.createChurchFact = asyncHandler(async (req, res, next) => {
  devLog("createChurchFact"); 

  const {churchId, description, value } = req.body;

  const fact = await db.churchfacts.create({
    churchId: churchId,  
    description: description,
    fact: value
  });

  if( fact === null){ 
    return next(new ErrorResponse('Error: church fact not created', 401)); 
  } 

    res.status(200).json({
      success: true,
      fact: fact
    });
  }); 

//  @desc   Get Church Facts
//  @route  GET /api/v1/church/fact/:churchId
//  @access Private
exports.getChurchFacts = asyncHandler(async (req, res, next) => {
  devLog("getChurchFacts"); 

  const churchId = req.params.churchId;
  const facts = await db.churchfacts.findAll({ where: { 
    churchId: churchId
  },
    attributes: [['id', 'id'],['churchId','churchId'],['description','description'],['fact','fact'],['createdAt','createdAt']],
    order: ['createdAt']
  })

    res.status(200).json({
      success: true,
      facts: facts
    });
  });

//  @desc   Edit Church Fact
//  @route  PUT /api/v1/church/fact
//  @access Private
exports.editChurchFact = asyncHandler(async (req, res, next) => {
  devLog("editChurchFact"); 

  const {id, churchId, updatedDescription, updatedValue } = req.body;

  devLog("id: " + JSON.stringify(id));
  devLog("churchId: " + JSON.stringify(churchId));
  devLog("updatedDescription: " + JSON.stringify(updatedDescription));
  devLog("updatedValue: " + JSON.stringify(updatedValue));

  const fact = await db.churchfacts.findOne({ where: { id: id, churchId: churchId }});

  if( fact === null){ return next(new ErrorResponse('No church fact found', 401)); } 

    // update and save church fact
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

//  @desc   Delete Church Fact
//  @route  DEL /api/v1/church/fact/:factId
//  @access Private
exports.deleteChurchFact = asyncHandler(async (req, res, next) => {
  devLog("deleteChurchFact"); 

  const factId = parseInt(req.params.factId)

  devLog("factId: " + JSON.stringify(factId)); 

  const deleteResult = await db.churchfacts.destroy({
      where: {
          id: factId
      }
  })

  devLog("deleteResult: " + JSON.stringify(deleteResult))

    res.status(200).json({
      success: true,
      deleteResult: deleteResult
    });
  });

  function getInviteCode () {
    const chars = ["A","B","C","E","F","G","H","I","K","L","P","Q","R","T","2","3","4","6","7","8","9","Y","U","W","X","Z","V"]
    newCode = []
    for (let i=0;i<40;i++) {
        let rando = Math.floor(Math.random()*26)
        if (rando > 26) {continue}
        newCode.push(chars[rando]);
        if (newCode.length > 7)
        {break;}
    }
    let inviteCode = "" + newCode[0] + newCode[1] + newCode[2] + newCode[3] + newCode[4] + newCode[5] + newCode[6];
    
    return inviteCode;
}