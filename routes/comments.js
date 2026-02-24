const express = require("express");
const db = require("../db_pool");
const { formateCommentData } = require("../utils/utils");
const router = express.Router();

// To Delete A comment
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const curUser = req.user;
        const { rows } = await db.query("SELECT id , user_id, ticket_id FROM ticket_comments WHERE id = $1", [id]);
        if (!rows || rows.length == 0) {
            res.status(404).json({ message: "Comment Not Found" });
            return;
        }

        if (curUser.role == "MANAGER" || curUser.id == rows[0].user_id) {// only Manager and Auther can delete comments
            await db.query("DELETE FROM ticket_comments WHERE id = $1", [id]);
            res.status(204).json({ message: "Comment Deleted" });
        } else {
            res.status(401).json({ message: "Only Author or Manager Can delete comments" });
        }
    } catch (err) {
        console.log('err = ', err);
        res.status(500).json({ message: err.message });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const curUser = req.user;
        const { comment } = req.body;
        const { rows } = await db.query("SELECT id , user_id, ticket_id FROM ticket_comments WHERE id = $1", [id]);
        if (!rows || rows.length == 0) {
            res.status(404).json({ message: "Comment Not Found" });
            return;
        }
        if (curUser.role == "MANAGER" || curUser.id == rows[0].user_id) { // only Manager and Auther can modify comments
            const resultRows = (await db.query("UPDATE ticket_comments SET comment = $1 WHERE id = $2 RETURNING *", [comment, id])).rows;

            const formateData = (await formateCommentData(resultRows))[0];
            res.status(200).json(formateData);
        } else {
            res.status(401).json({ message: "Only Author or Manager can Update comments" });
        }
    } catch (err) {
        console.log('err = ', err);
        res.status(500).json({ message: err.message });
    }
})
module.exports = router;