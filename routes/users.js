const express = require('express');
const db = require("../db_pool");
const bcryptjs = require("bcryptjs");
const {formateUserData} = require("../utils/utils");
const router = express.Router();

// Get All Users
router.get("/", async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT u.id, u.name AS name, u.email , u.created_at, u.role_id, r.name AS role 
            FROM users AS u
            JOIN roles AS r
            ON u.role_id = r.id
        `);
        const formmatedData = formateUserData(rows);
        res.status(200).json(formmatedData);
    } catch (err) {
        console.log('err = ', err);
        res.status(500).json({ message: err.message });
    }
});

// Create new User
router.post("/", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            res.status(400).json({ message: "Bad Request" });
            return;
        }
        // const hasedPassword = bcryptjs.hashSync(password, Number(process.env.SALT));
        const hasedPassword = password;
        const role_id = getRoleId(role);

        const {rows} = await db.query(`INSERT into users (name , email, password, role_id, created_at) VALUES ($1,$2,$3,$4,$5) RETURNING *`, [name, email, hasedPassword, role_id, new Date()]);

        console.log("rows  = ", rows);
        const formmatedData = formateUserData(rows);
        res.status(200).json(formmatedData);
    } catch (err) {
        console.log('err = ', err);
        res.status(500).json({ message: err.message });
    }
});

function getRoleId(role) {
    if (role == "MANAGER")
        return 1;
    if (role == "SUPPORT")
        return 2;
    if (role == "USER")
        return 3;

    throw Error("Role Invalid");
}

module.exports = router;