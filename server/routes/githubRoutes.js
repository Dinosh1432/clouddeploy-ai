const express = require("express");

const {
    getRepository,
    getConnectedRepositories
} = require("../controllers/githubController");

const protect =
    require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// CONNECTED REPOSITORIES
// ==========================================

router.get(
    "/repositories",
    protect,
    getConnectedRepositories
);


// ==========================================
// SINGLE REPOSITORY
// ==========================================

router.get(
    "/repo/:owner/:repo",
    protect,
    getRepository
);


module.exports = router;