const express = require('express');
const db = require("../db_pool");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const { rows } = await db.query(`SELECT u.id, u.email , u.password, r.name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1`, [email]);
        console.log("result = ", rows);
        const isMatched = await bcryptjs.compare(password, rows[0].password);
        if (!isMatched) {
            res.status(401).json({ message: "Credentials not matched" });
            return;
        }

        const token = jwt.sign(
            { id: rows[0].id, role: rows[0].name },
            process.env.JWT_KEY,
            { expiresIn: "3h" },
        );

        res.status(200).json({ "token": token });s
    } catch (err) {
        console.log('err = ', err);
        res.status(500).json({ message: err.message });
    }

});
module.exports = router;