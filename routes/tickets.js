const express = require("express");
const db = require("../db_pool");
const { authorizeRole } = require("../authMiddleware");
const { formateTicketData, getUserById, getStatusId, formateCommentData } = require("../utils/utils");
const router = express.Router();

// Get All Tickets
router.get("/", async (req, res) => {
    try {
        const curUser = req.user;
        var rows;
        if (curUser.role == "MANAGER") {
            rows = (await db.query("SELECT * FROM tickets")).rows;
        } else if (curUser.role == "SUPPORT") {
            rows = (await db.query("SELECT * FROM tickets WHERE assigned_to = $1", [curUser.id])).rows;
        } else {
            rows = (await db.query("SELECT * FROM tickets WHERE created_by = $1", [curUser.id])).rows;
        }
        const formateData = (await formateTicketData(rows));
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
            res.status(400).json({ message: "Input Incompleted" });
            return;
        }
        if (title.length < 5 || description.length < 10) {
            res.status(400).json({ message: "Input invalid" });
            return;
        }

        const curUser = await getUserById(req.user.id);

        const { rows } = await db.query(`
                INSERT INTO tickets (title, description, priority ,status , created_by, created_at) 
                VALUES ($1,$2,$3,$4,$5,$6) 
                RETURNING *`, [title, description, priority, "OPEN", curUser.id, new Date()]);

        const formateData = (await formateTicketData(rows, curUser))[0];
        res.status(201).json(formateData);
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
            res.status(400).json({ message: "Input Incompleted" });
        }
        const assigned_to_user = await getUserById(userId);

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

        const formateData = (await formateTicketData(rows, null, assigned_to_user))[0];

        res.status(200).json(formateData);
    } catch (err) {
        console.log('err = ', err);
        res.status(500).json({ message: err.message });
    }
});

// Update Ticket Status
router.patch("/:id/status", authorizeRole("MANAGER", "SUPPORT"), async (req, res) => {
    const client = await db.connect();
    try {
        const ticketId = req.params.id;
        const { status } = req.body;
        const curUser = req.user;

        if (!ticketId || !status) {
            res.status(400).json({ message: "Input Incompleted" });
            return;
        }
        var { rows } = (await client.query(`SELECT id,title,status FROM tickets WHERE id = $1`, [ticketId]));
        if (!rows || rows == []) {
            res.status(404).json({ message: "Ticket Not Found" });
            return;
        }
        const old_status = rows[0].status;

        if (getStatusId(status) <= getStatusId(old_status)) {
            res.status(400).json({ message: "Invalid Status" });
            return;
        }

        await client.query("BEGIN;");

        const resultRows = (await client.query(`
            UPDATE tickets
            SET status = $1
            WHERE id = $2
            RETURNING *    
        `, [status, ticketId])).rows;

        await client.query(`
            INSERT INTO ticket_status_logs (ticket_id , old_status, new_status , changed_by, changed_at)
            VALUES ($1,$2,$3,$4,$5)
        `, [ticketId, old_status, status, curUser.id, new Date()]);

        const formateData = (await formateTicketData(resultRows))[0];

        await client.query("COMMIT;");
        res.status(200).json(formateData);
    } catch (err) {
        await client.query("ROLLBACK;");
        console.log('err = ', err);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

// Delete Ticket
router.delete("/:id", authorizeRole("MANAGER"), async (req, res) => {
    const client = await db.connect();
    try {
        await client.query("BEGIN;");
        const id = req.params.id;

        await client.query("DELETE FROM ticket_comments WHERE ticket_id = $1", [id]);

        await client.query("DELETE FROM ticket_status_logs WHERE ticket_id = $1", [id]);

        await client.query("DELETE FROM tickets WHERE id = $1", [id]);

        await client.query("COMMIT;");
        res.status(204);
    } catch (err) {
        console.log('err = ', err);
        await client.query("ROLLBACK;");
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

// To Get All Comment
router.get("/:id/comments", async (req, res) => {
    try {
        const id = req.params.id;
        const { rows } = await db.query("SELECT * FROM ticket_comments WHERE ticket_id = $1", [id]);

        await formateCommentData(rows).then((val) => {
            const formateData = val;
            res.status(200).json(formateData);
        });

    } catch (err) {
        console.log('err = ', err);
        res.status(500).json({ message: err.message });
    }
});

// to Add Commet
router.post("/:id/comments", async (req, res) => {
    try {
        const id = req.params.id;
        const { comment } = req.body;
        const curUser = req.user;

        const { rows } = await db.query(`
            INSERT INTO ticket_comments (ticket_id , user_id , comment,  created_at) 
            VALUES ($1,$2,$3,$4) RETURNING *
        `, [id, curUser.id, comment, new Date()]);

        await formateCommentData(rows).then((val) => {
            const formateData = val[0];
            res.status(201).json(formateData);
        });

    } catch (err) {
        console.log('err = ', err);
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;