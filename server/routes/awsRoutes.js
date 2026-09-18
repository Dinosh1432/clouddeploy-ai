const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    getAWSResources
} = require("../controllers/awsController");


const router = express.Router();


// ==========================================
// GET AWS RESOURCES
// ==========================================

router.get(
    "/resources",
    protect,
    getAWSResources
);


module.exports = router;