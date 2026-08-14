const express = require("express");

const {
    getRepository
} = require("../controllers/githubController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/repo/:owner/:repo",
    protect,
    getRepository
);

module.exports = router;