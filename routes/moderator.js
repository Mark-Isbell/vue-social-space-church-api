const express = require("express");

const {
    updateRequest,
    getPendingRequests,
    reportComment,
    complete,
    deleteMemberComment,
    restrictOneStream,
    restrictAllStreams,
    getReports,
    removeFromChurch,
    promoteModerator,
    addToStream,
    getAllRestrictions,
    unrestrict,
    unrestrictChurchJoin
} = require("../controllers/moderator");

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require("../middleware/auth");
const { logger } = require("../middleware/logger");

router
  .route("/updaterequest")
  .put(logger,protect, authorize("moderator"), updateRequest);

router
  .route("/getpendingrequests")
  .get(logger,protect, authorize("moderator"), getPendingRequests);

router
  .route("/reportcomment")
  .post(logger,protect, reportComment);

router
  .route("/complete")
  .put(logger,protect, complete);

router
  .route("/deletecomment/:commentId")
  .delete(logger,protect, deleteMemberComment);

router
  .route("/restrictone")
  .put(logger,protect, restrictOneStream);

router
  .route("/restrictall")
  .put(logger,protect, restrictAllStreams);

router
  .route("/reports")
  .get(logger,protect, authorize("moderator"), getReports);

router
  .route("/removefromchurch")
  .put(logger,protect, removeFromChurch);

router
  .route("/promote")
  .put(logger,protect, promoteModerator);

router
  .route("/addtostream") 
  .put(logger,protect, addToStream);

router
  .route("/getallrestrictions/:userName") 
  .get(logger,protect, authorize("moderator"), getAllRestrictions);

router
  .route("/unrestrict") 
  .put(logger,protect, unrestrict);

router
  .route("/unrestrictchurchjoin") 
  .put(logger,protect, unrestrictChurchJoin);

module.exports = router;
