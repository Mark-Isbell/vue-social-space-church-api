const express = require("express");
const {
  syncHardDemoData,
  syncHardInitialChurchSetUp
} = require("../controllers/sequelizeSync");

/*
base URL: /sequelizesync
*/

const router = express.Router({ mergeParams: true });

const { logger } = require("../middleware/logger");

router
  .route("/syncharddemodata") 
  .get(logger,syncHardDemoData);

router
  .route("/synchardinitialchurchsetup") 
  .get(logger,syncHardInitialChurchSetUp);

// Example call:
// {{URL}}/api/v1/sequelizesync/synchardinitialchurchsetup

module.exports = router;
