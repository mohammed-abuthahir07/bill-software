const {
    getUserById,
    findUserByEmail,
    updateUser,
    getProfileByUserId,
    createProfile,
    updateProfile
} = require("../models/profile.model");

const { saveProfileImage } = require("../models/profile.model");

// ========================================
// GET PROFILE
// ========================================

const getProfile = async (req, res) => {

    try {

        const user = await getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const profile = await getProfileByUserId(req.user.id);

        res.json({
            success: true,
            user,
            profile
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

// ========================================
// UPDATE PROFILE
// ========================================

const updateUserProfile = async (req, res) => {

    try {

        const {
            name,
            email,
            company_name,
            mobile,
            alternate_email,
            gst_number,
            address,
            city,
            state,
            country,
            pincode,
            website,
            profile_image
        } = req.body;

        // --------------------------
        // Validate User Fields
        // --------------------------

        if (!name || !email) {

            return res.status(400).json({
                message: "Name and Email are required"
            });

        }

        // --------------------------
        // Check Email Exists
        // --------------------------

        const existingUser = await findUserByEmail(email);

        if (existingUser && existingUser.id !== req.user.id) {

            return res.status(409).json({
                message: "Email already exists"
            });

        }

        // --------------------------
        // Update users table
        // --------------------------

        await updateUser(
            req.user.id,
            name,
            email
        );

        // --------------------------
        // Check Profile Exists
        // --------------------------

        const profile = await getProfileByUserId(req.user.id);

        if (!profile) {

            await createProfile(

                req.user.id,

                company_name || null,
                mobile || null,
                alternate_email || null,
                gst_number || null,
                address || null,
                city || null,
                state || null,
                country || null,
                pincode || null,
                website || null,
                profile_image || null

            );

        } else {

            await updateProfile(

                req.user.id,

                company_name || null,
                mobile || null,
                alternate_email || null,
                gst_number || null,
                address || null,
                city || null,
                state || null,
                country || null,
                pincode || null,
                website || null,
                profile_image || null

            );

        }

        // --------------------------
        // Return Updated Data
        // --------------------------

        const updatedUser = await getUserById(req.user.id);

        const updatedProfile = await getProfileByUserId(req.user.id);

        res.json({

            success: true,

            message: "Profile updated successfully",

            user: updatedUser,

            profile: updatedProfile

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

const uploadProfileImage = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "Please select an image."
            });

        }

        const imagePath =
            `/uploads/profile/${req.file.filename}`;

        await saveProfileImage(
            req.user.id,
            imagePath
        );

        res.json({

            success: true,

            message: "Profile image uploaded successfully",

            profile_image: imagePath

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};


module.exports = {
    getProfile,
    updateUserProfile,
    uploadProfileImage
};