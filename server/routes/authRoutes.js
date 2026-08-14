const express = require("express");

const {
    register,
    login
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/profile", protect, (req, res) => {
    res.json({
        message: "You accessed a protected route",
        userId: req.user.userId
    });
});

module.exports = router;