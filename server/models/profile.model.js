const { pool } = require("../config/database");

// Get logged-in user
const getUserById = async (id) => {
    const query = `
        SELECT id, name, email
        FROM users
        WHERE id = ?
        LIMIT 1
    `;

    const [rows] = await pool.execute(query, [id]);

    return rows[0];
};

// Find email
const findUserByEmail = async (email) => {
    const query = `
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
    `;

    const [rows] = await pool.execute(query, [email]);

    return rows[0];
};

// Update profile
const updateUser = async (id, name, email) => {
    const query = `
        UPDATE users
        SET
            name = ?,
            email = ?
        WHERE id = ?
    `;

    await pool.execute(query, [name, email, id]);
};

const getProfileByUserId = async (userId) => {

    const [rows] = await pool.execute(
        `
        SELECT *
        FROM user_profiles
        WHERE user_id = ?
        LIMIT 1
        `,
        [userId]
    );

    return rows[0];

};
const createProfile = async (
    userId,
    companyName,
    mobile,
    alternateEmail,
    gstNumber,
    address,
    city,
    state,
    country,
    pincode,
    website,
    profileImage
) => {

    const [result] = await pool.execute(
        `
        INSERT INTO user_profiles
        (
            user_id,
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
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
        `,
        [
            userId,
            companyName,
            mobile,
            alternateEmail,
            gstNumber,
            address,
            city,
            state,
            country,
            pincode,
            website,
            profileImage
        ]
    );

    return result;

};
const updateProfile = async (
    userId,
    companyName,
    mobile,
    alternateEmail,
    gstNumber,
    address,
    city,
    state,
    country,
    pincode,
    website,
    profileImage
) => {

    const [result] = await pool.execute(
        `
        UPDATE user_profiles
        SET

        company_name = ?,
        mobile = ?,
        alternate_email = ?,
        gst_number = ?,
        address = ?,
        city = ?,
        state = ?,
        country = ?,
        pincode = ?,
        website = ?,
        profile_image = ?

        WHERE user_id = ?
        `,
        [
            companyName,
            mobile,
            alternateEmail,
            gstNumber,
            address,
            city,
            state,
            country,
            pincode,
            website,
            profileImage,
            userId
        ]
    );

    return result;

};

// Save Profile Image
const saveProfileImage = async (userId, profileImage) => {

    const [rows] = await pool.execute(
        `
        SELECT id
        FROM user_profiles
        WHERE user_id = ?
        LIMIT 1
        `,
        [userId]
    );

    if (rows.length > 0) {

        await pool.execute(
            `
            UPDATE user_profiles
            SET
                profile_image = ?
            WHERE user_id = ?
            `,
            [
                profileImage,
                userId
            ]
        );

    } else {

        await pool.execute(
            `
            INSERT INTO user_profiles
            (
                user_id,
                profile_image
            )
            VALUES (?, ?)
            `,
            [
                userId,
                profileImage
            ]
        );

    }

};
module.exports = {

    // Existing Functions
    getUserById,
    findUserByEmail,
    updateUser,

    // New Functions
    getProfileByUserId,
    createProfile,
    updateProfile,

    // Image Upload
    saveProfileImage
};