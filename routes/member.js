const express = require("express");

const {
  updateMemberChurch,
  uploadPic,
  updateIntroduction,
  updateStream,
  joinStream,
  updateAccount,
  getMemberFacts,
  editMemberFact,
  deleteMemberFact,
  createMemberFact
} = require("../controllers/member");

const router = express.Router({ mergeParams: true });

const { protect } = require("../middleware/auth");
const { logger } = require("../middleware/logger");

router
  .route("/church")
  .put(logger,protect, updateMemberChurch);

router
  .route("/profilepic")
  .post(logger,protect, uploadPic);

router
  .route("/introduction")
  .put(logger,protect, updateIntroduction);

router
  .route("/stream")
  .put(logger,protect, updateStream);

router
  .route("/joinstream")
  .post(logger,protect, joinStream);

router
  .route("/account")
  .put(logger,protect, updateAccount);

router
  .route("/fact")
  .get(logger,protect, getMemberFacts)
  .put(logger,protect, editMemberFact)
  .post(logger,protect, createMemberFact); 

router
  .route("/fact/:factId")
  .delete(logger,protect, deleteMemberFact);

module.exports = router;
