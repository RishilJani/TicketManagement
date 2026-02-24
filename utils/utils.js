const db = require("../db_pool");

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

async function getUserById(id = null) {
    if(id == null) return null;
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

function formateTicketData(rows, { created_by = null, assigned_to = null }) {

    return rows.map(async (v) => {
        if (created_by == null) {
            created_by = await getUserById(v.created_by);
        }
        if (assigned_to == null) {
            assigned_to = await getUserById(v.created_by);
        }

        return { ...v, created_by: created_by, assigned_to: assigned_to };
    });
}

const INCOMPLETE_REQUEST = { message: "Input Incompleted" };
module.exports = { formateUserData, formateTicketData, INCOMPLETE_REQUEST, getUserById };