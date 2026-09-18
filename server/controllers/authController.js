const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");


// ==========================================
// REGISTER
// ==========================================

const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password
        } = req.body;


        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }


        const existingUser =
            await User.findOne({ email });


        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }


        const hashedPassword =
            await bcrypt.hash(password, 10);


        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });


        res.status(201).json({
            message:
                "User registered successfully",

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// LOGIN
// ==========================================

const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;


        if (!email || !password) {
            return res.status(400).json({
                message:
                    "Email and password are required"
            });
        }


        const user =
            await User.findOne({ email });


        if (!user) {
            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }


        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {
            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }


        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );


        res.status(200).json({
            message: "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================================
// GET PROFILE
// ==========================================

const getProfile = async (req, res) => {
    try {

        const user =
            await User.findById(
                req.user.userId
            ).select(
                "_id name email"
            );


        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error(
            "Get profile error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to load profile"
        });
    }
};


// ==========================================
// UPDATE PROFILE
// ==========================================

const updateProfile = async (req, res) => {
    try {

        const {
            name,
            email
        } = req.body;


        if (!name || !email) {
            return res.status(400).json({
                message:
                    "Name and email are required"
            });
        }


        const existingUser =
            await User.findOne({
                email,
                _id: {
                    $ne: req.user.userId
                }
            });


        if (existingUser) {
            return res.status(409).json({
                message:
                    "Email is already in use"
            });
        }


        const user =
            await User.findByIdAndUpdate(
                req.user.userId,
                {
                    name,
                    email
                },
                {
                    new: true,
                    runValidators: true
                }
            ).select(
                "_id name email"
            );


        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        res.status(200).json({
            message:
                "Profile updated successfully",

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error(
            "Update profile error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to update profile"
        });
    }
};


// ==========================================
// CHANGE PASSWORD
// ==========================================

const changePassword = async (req, res) => {
    try {

        const {
            currentPassword,
            newPassword
        } = req.body;


        if (
            !currentPassword ||
            !newPassword
        ) {
            return res.status(400).json({
                message:
                    "Current password and new password are required"
            });
        }


        if (newPassword.length < 6) {
            return res.status(400).json({
                message:
                    "New password must be at least 6 characters"
            });
        }


        const user =
            await User.findById(
                req.user.userId
            );


        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        const passwordMatch =
            await bcrypt.compare(
                currentPassword,
                user.password
            );


        if (!passwordMatch) {
            return res.status(401).json({
                message:
                    "Current password is incorrect"
            });
        }


        user.password =
            await bcrypt.hash(
                newPassword,
                10
            );


        await user.save();


        res.status(200).json({
            message:
                "Password changed successfully"
        });

    } catch (error) {

        console.error(
            "Change password error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to change password"
        });
    }
};


module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
};