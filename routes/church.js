const express = require("express");
const {
  getChurch,
  getAllChurchMembers,
  getChurchMember,
  getChurchMemberByName,
  updateChurch,
  generateNewInviteCode,
  updateModerationPolicy,
  getChurchByInviteCode,
  getChurchLinks,
  editChurchLink,
  deleteChurchLink,
  createChurchLink,
  createEvent,
  getEvent,
  getEvents,
  editEvent,
  deleteEvent,
  createChurchFact,
  getChurchFacts,
  editChurchFact,
  deleteChurchFact
} = require("../controllers/church");

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require("../middleware/auth");
const { logger } = require("../middleware/logger");

router
  .route("/member")
  .get(logger,protect, getChurch);

router
  .route("/members/:limit/:offset")
  .get(logger,protect, getAllChurchMembers);

router
  .route("/member/:id")
  .get(logger,protect, getChurchMember);

router
  .route("/member/name/:username")
  .get(logger,protect, getChurchMemberByName);

router
  .route("/invitecode/:code")
  .get(logger,protect, getChurchByInviteCode);

router
  .route("/update")
  .put(logger,protect, authorize("moderator"), updateChurch);

router
  .route("/generatenewinvitecode")
  .get(logger,protect, authorize("moderator"),generateNewInviteCode);

router
  .route("/updatemoderationpolicy")
  .put(logger,protect, authorize("moderator"), updateModerationPolicy);

router
  .route("/link")
  .get(logger,protect, getChurchLinks)
  .post(logger,protect, authorize("moderator"), createChurchLink);

router
  .route("/link/:linkId")
  .delete(logger,protect, authorize("moderator"), deleteChurchLink);

router
  .route("/link/update")
  .put(logger,protect, authorize("moderator"), editChurchLink);

router
  .route("/event")
  .post(logger,protect, authorize("moderator"), createEvent);

router
  .route("/event/:eventId")
  .get(logger,protect, authorize("moderator"), getEvent)
  .delete(logger,protect, authorize("moderator"), deleteEvent);

router
  .route("/events/:beginMonth/:beginDay/:beginYear/:endMonth/:endDay/:endYear")
  .get(logger,protect, getEvents);

router
  .route("/event/update")
  .put(logger,protect, authorize("moderator"), editEvent);

router
  .route("/fact")
  .put(logger,protect, editChurchFact)
  .post(logger,protect, createChurchFact); 

router
  .route("/fact/:churchId")
  .get(logger,protect, getChurchFacts)

router
  .route("/fact/:factId")
  .delete(logger,protect, deleteChurchFact);

module.exports = router;
