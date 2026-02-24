const db = require("../db_pool");
// to get a user by given id
async function getUserById(id = null) {
    if (id == null) return null;
    try {
        const { rows } = await db.query(`
            SELECT u.id, u.name AS name, u.email , u.created_at, u.role_id, r.name AS role 
            FROM users AS u
            JOIN roles AS r
            ON u.role_id = r.id
            WHERE u.id = $1
        `, [id]);
        return formateUserData(rows)[0];
    } catch (err) {
        console.log('err = ', err);
    }
}

// to formate the input user Data
function formateUserData(rows) {
    return rows.map((v) => {
        return {
            id: v.id,
            name: v.name,
            email: v.email,
            role: {
                id: v.role_id,
                name: v.role
            },
            created_at: v.created_at
        };
    });
}

// to formate the input ticket data
async function formateTicketData(rows, created_by = null, assigned_to = null) {
    var formateData = [];
    for await (const v of rows) {
        const ans = { ...v, created_by: created_by, assigned_to: assigned_to }
        if (created_by == null) {
            ans.created_by = await getUserById(v.created_by);
        }
        if (assigned_to == null) {
            ans.assigned_to = await getUserById(v.created_by);
        }
        console.log(ans);
        formateData.push(ans);
    }
    return formateData;
}

// to formate the input ticket comment data
async function formateCommentData(rows) {
    var ans = [];
    for await (const v of rows) {
        const us = await getUserById(v.user_id);
        ans.push({ id: v.id, comment: v.comment, user: us, created_at: v.created_at });
    }
    return ans;
}

// to convert status in to number to compare
function getStatusId(status) {
    if (status == "OPEN") {
        return 1;
    } else if (status == "IN_PROGRESS") {
        return 2;
    } else if (status == "RESOLVED") {
        return 3;
    } else if (status == "CLOSED") {
        return 4;
    }
}

module.exports = { formateUserData, formateTicketData, getUserById, getStatusId, formateCommentData };