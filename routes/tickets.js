const express = require("express");
const db = require("../db_pool");
const { authorizeRole } = require("../authMiddleware");
const { formateTicketData, INCOMPLETE_REQUEST, getUserById, getStatusId } = require("../utils/utils");
const router = express.Router();

// Get All Tickets
router.get("/", async (req, res) => {
    try {
        const curUser = req.user;
        var rows;
        if (curUser.role == "MANAGER") {
            rows = (await db.query("SELECT * FROM tickets")).rows;
        } else if (curUser.role == "SUPPORT") {
            rows = (await db.query("SELECT * FROM tickets WHERE assigned_to = $1",[curUser.id])).rows;
        } else {
            rows = (await db.query("SELECT * FROM tickets WHERE created_by = $1",[curUser.id])).rows;
        }
        const formateData = await formateTicketData(rows);
        res.status(200).json(formateData);
    } catch (err) {
        console.log('err = ', err);
        res.status(500).json({ message: err.message });
    }
});

// Create New Ticket
router.post("/", authorizeRole("USER", "MANAGER"), async (req, res) => {
    try {
        const { title, description, priority } = req.body;
        if (!title || !description || !priority) {
            res.status(400).json(INCOMPLETE_REQUEST);
            return;
        }
        if (title.length < 5 || description.length < 10) {
            res.status(400).json({ message: "Input invalid" });
            return;
        }

        const curUser = await getUserById(req.user.id);

        const { rows } = await db.query(`
                INSERT INTO tickets (title, description, priority ,status , created_by, created_at) 
                VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [title, description, priority, "OPEN", curUser.id, new Date()]);

        const formateData = formateTicketData(rows, curUser)[0];
        res.status(200).json(formateData);
    } catch (err) {
        console.log('err = ', err);
        res.status(500).json({ message: err.message });
    }
});

// Assign Ticket
router.patch("/:id/assign", authorizeRole("MANAGER", "SUPPORT"), async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { userId } = req.body;
        if (!ticketId || !userId) {
            res.status(400).json(INCOMPLETE_REQUEST);
        }
        const assigned_to_user = await getUserById(userId);
        console.log("assigned_to_user = ", assigned_to_user);

        if (assigned_to_user.role == "USER") {
            res.status(400).json({ message: "Ticket Cannot be Assigned to USER" });
            return;
        }

        const { rows } = await db.query(`
            UPDATE tickets
            SET assigned_to = $1
            WHERE id = $2
            RETURNING *    
        `, [assigned_to_user.id, ticketId]);

        const formateData = await formateTicketData(rows, null, assigned_to_user)[0];

        res.status(200).json(formateData);
    } catch (err) {
        console.log('err = ', err);
        res.status(500).json({ message: err.message });
    }
});

// Update Ticket Status
router.patch("/:id/status", authorizeRole("MANAGER", "SUPPORT"), async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { status } = req.body;
        if (!ticketId || !status) {
            res.status(400).json(INCOMPLETE_REQUEST);
            return;
        }
        var { rows } = (await db.query(`SELECT id,title,status FROM tickets WHERE id = $1`, [ticketId]));
        if (!rows || rows == []) {
            res.status(404).json({ message: "Ticket Not Found" });
            return;
        }

        if (getStatusId(status) <= getStatusId(rows[0].status)) {
            res.status(400).json({ message: "Invalid Status" });
            return;
        }

        const resultRows = (await db.query(`
            UPDATE tickets
            SET status = $1
            WHERE id = $2
            RETURNING *    
        `, [status, ticketId])).rows;
        
        const formateData = await formateTicketData(resultRows)[0];
        console.log("formateData = ", formateData);

        res.status(200).json(formateData);
    } catch (err) {
        console.log('err = ', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;