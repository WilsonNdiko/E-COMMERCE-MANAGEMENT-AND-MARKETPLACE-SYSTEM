const express = require("express");
const router = express.Router();
const {
  getAllReviews,
  getProductReviews,
  createProductReview,
  deleteReview,
} = require("../controllers/reviews");

router.route("/").get(getAllReviews);
router.route("/product/:productId").get(getProductReviews).post(createProductReview);
router.route("/:id").delete(deleteReview);

module.exports = router;
