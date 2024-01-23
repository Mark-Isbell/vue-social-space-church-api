const express = require("express");
const {
  replace,
  updateOrReplace,
  getOlder,
  getStreamInformation,
  getStreamMembers,
  getMemberStreams,
  postComment,
  editComment,
  deleteComment,
  updateReaction,
  createStream,
  updateStream,
  getStreamHeaders,
  requestJoin,
  getExistingJoinRequests
} = require("../controllers/stream");

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require("../middleware/auth");
const { logger } = require("../middleware/logger");

router
  .route("/:id/replace") 
  .get(logger,protect, replace);

router
  .route("/:id/updateorreplace/:commentId") 
  .get(logger,protect, updateOrReplace);

router
  .route("/:id/:oldestStreamCommentId/older") 
  .get(logger,protect, getOlder);

router
  .route("/comment") 
  .put(logger,protect, editComment)
  .post(logger,protect, postComment);

router
  .route("/comment/reaction")
  .put(logger,protect, updateReaction);

router
  .route("/comment/:commentId") 
  .delete(logger,protect, deleteComment);

router
  .route("/create") 
  .post(logger,protect, authorize("moderator"), createStream);

router
  .route("/update") 
  .put(logger,protect, updateStream);

router
  .route("/:id/members") 
  .get(logger,protect, getStreamMembers);

router
  .route("/information/:id") 
  .get(logger,protect, getStreamInformation);

router
  .route("/streams/member/:memberName") 
  .get(logger,protect, getMemberStreams);

router
  .route("/headers") 
  .get(logger,protect, getStreamHeaders); 

router
  .route("/request") 
  .post(logger,protect, requestJoin);

router
  .route("/requests/:id") 
  .get(logger,protect, getExistingJoinRequests);

module.exports = router;
