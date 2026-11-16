const express = require("express");
const router = express.Router();
const {
  getMessages,
  createMessage,
  updateMessageStatus,
  deleteMessage,
} = require("../controllers/contact");

router.route("/").get(getMessages).post(createMessage);
router.route("/:id").put(updateMessageStatus).delete(deleteMessage);

module.exports = router;
