const express = require("express");
const router = express.Router();
const {
  getAdminStats,
  getStoreSettings,
  updateStoreSettings,
} = require("../controllers/adminStats");

router.get("/stats", getAdminStats);
router.route("/settings").get(getStoreSettings).put(updateStoreSettings);

module.exports = router;
