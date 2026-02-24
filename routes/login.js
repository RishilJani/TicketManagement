const express = require('express');
const db = require("../db_pool");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const {rows} = await db.query(`SELECT u.id, u.email , u.password, r.name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1`,[email]);
    console.log("result = ", rows);
    
    // const token = jwt.sign({
        
    // });
    res.status(200).json({"token" : "This is token"});
});
module.exports = router;