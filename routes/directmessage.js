const express = require("express");

const {
    createDirectMessage,
    createDirectMessageComment,
    addMemberToDirectMessage,
    getDirectMessageHeaders,
    getDirectMessageComments,
    updateMemberWithDirectMessageId,
    getOlderDirectMessageComments
} = require("../controllers/directmessage");

const router = express.Router({ mergeParams: true });

const { protect } = require("../middleware/auth");
const { logger } = require("../middleware/logger");

router
  .route("/createdirectmessage")
  .post(logger,protect, createDirectMessage);

router
  .route("/createdmcomment")
  .post(logger,protect, createDirectMessageComment);

router
  .route("/addmember")
  .post(logger,protect, addMemberToDirectMessage);

router
  .route("/getdirectmessageheaders")
  .get(logger,protect, getDirectMessageHeaders);

router
  .route("/getdirectmessagecomments/:id")
  .get(logger,protect, getDirectMessageComments);

router
  .route("/updatemember/:directMessageId")
  .put(logger,protect, updateMemberWithDirectMessageId);

router
  .route("/:id/:oldestDirectMessageCommentId/older") 
  .get(logger,protect, getOlderDirectMessageComments);

module.exports = router;
