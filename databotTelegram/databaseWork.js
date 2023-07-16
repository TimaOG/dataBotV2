const { Pool } = require('pg')
const pool = new Pool({
    user: "postgres",
    database: "bot",
    password: "root",
    port: 5432,
    host: "127.0.0.1",
});


async function createUserIfExist(userFirstName, userId, userName) {
    pool.query(`INSERT INTO Users (id, userfirstname, username) 
    VALUES ($1, $2, $3) ON CONFLICT (id)
    DO NOTHING`, [userId, userFirstName, userName]);
}

async function addWork(workInfo) {
    const workIdArr = await pool.query(`INSERT INTO Works (workName, fkuserowner, description,
        price, fkworktypefirst, fkworktypesecond, isfree, adddate) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING id`,
        [workInfo.workName, workInfo.userId, workInfo.workDiscribtion, workInfo.workPrice, workInfo.firstCategory,
        workInfo.secondCategory, workInfo.isFree])
    const workId = workIdArr.rows[0]["id"];
    if (workInfo.tags != null) {
        for (let i = 0; i < workInfo.tags.length; i++) {
            pool.query(`INSERT INTO workTags (tagName, fkWork) VALUES ($1,$2)`,
                [workInfo.tags[i], workId])
        }
    }
}

async function addOrder(orderInfo) {
    const orderIdArr = await pool.query(`INSERT INTO orders (orderName, fkuserowner, description,
        price, fkworktypefirst, fkworktypesecond,adddate) VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING id`,
        [orderInfo.workName, orderInfo.userId, orderInfo.workDiscribtion, orderInfo.workPrice, orderInfo.firstCategory,
        orderInfo.secondCategory])
    const orderId = orderIdArr.rows[0]["id"];
    if (orderInfo.tags != null) {
        for (let i = 0; i < orderInfo.tags.length; i++) {
            pool.query(`INSERT INTO orderTags (tagName, fkWork) VALUES ($1,$2)`,
                [orderInfo.tags[i], orderId])
        }
    }
}

async function editWork(workInfo) {
    pool.query(`UPDATE Works SET workName = $1, description = $2, price = $3, 
    fkworktypefirst = $4, fkworktypesecond = $5, isfree = $6 WHERE id = $7 AND fkuserowner = $8`,
        [workInfo.workName, workInfo.workDiscribtion, workInfo.workPrice, workInfo.firstCategory,
        workInfo.secondCategory, workInfo.isFree, workInfo.id, workInfo.userId])
    await pool.query(`DELETE FROM workTags WHERE fkwork = $1`, [workInfo.id])
    if (workInfo.tags != null) {
        for (let i = 0; i < workInfo.tags.length; i++) {
            pool.query(`INSERT INTO workTags (tagName, fkWork) VALUES ($1,$2)`,
                [workInfo.tags[i], workInfo.id])
        }
    }
}

async function deleteWork(workId) {
    await pool.query(`INSERT INTO worksDelete (workName, fkuserowner, description,
        price, fkworktypefirst, fkworktypesecond, isfree, fileId, adddate, deleteTime, workId) SELECT
        workName, fkuserowner, description,
        price, fkworktypefirst, fkworktypesecond, isfree, fileId, adddate, NOW(), $1 FROM Works where id=$2`, [workId, workId])
    await pool.query(`DELETE FROM workTags WHERE fkwork = $1`, [workId])
    pool.query(`DELETE FROM Works WHERE id = $1`, [workId])
}
async function deleteOrder(workId) {
    await pool.query(`DELETE FROM orderTags WHERE fkwork = $1`, [workId])
    pool.query(`DELETE FROM Orders WHERE id = $1`, [workId])
}

async function getAddedWorks(userId) {
    const works = await pool.query("SELECT id, workname FROM Works WHERE fkuserowner = $1", [userId])
    return works.rows
}

async function getAddedOrders(userId) {
    const works = await pool.query("SELECT id, ordername FROM Orders WHERE fkuserowner = $1", [userId])
    return works.rows
}

async function getWorkInfo(workId) {
    const workInfo = await pool.query(`SELECT w.id, w.workName,
     w.description, w.price, w.isfree, w.fileid ,wf.worktypename as wtnf, ws.worktypename as wtns, w.adddate::varchar
      from works as w LEFT JOIN worktypefirst as wf on wf.id = w.fkworktypefirst 
      LEFT JOIN worktypesecond as ws on ws.id = w.fkworktypesecond where w.id = $1`, [workId]);
    const workTags = await pool.query('SELECT tagname from worktags where fkWork = $1 ', [workId]);
    return [workInfo.rows, workTags.rows]
}

async function getOrderInfo(workId) {
    const workInfo = await pool.query(`SELECT o.id, o.orderName,
     o.description, o.price, wf.worktypename as wtnf, ws.worktypename as wtns, o.adddate::varchar
      from orders as o LEFT JOIN worktypefirst as wf on wf.id = o.fkworktypefirst 
      LEFT JOIN worktypesecond as ws on ws.id = o.fkworktypesecond where o.id = $1`, [workId]);
    const workTags = await pool.query('SELECT tagname from ordertags where fkWork = $1 ', [workId]);
    return [workInfo.rows, workTags.rows]
}


async function getAccountInfo(userId) {
    const countWorks = await pool.query(`SELECT count(id) FROM Works WHERE fkuserowner=$1`, [userId]);
    const countOrders = await pool.query(`SELECT count(id) FROM Orders WHERE fkuserowner=$1`, [userId]);
    const countBWorks = await pool.query(`SELECT count(id) FROM boughtworks WHERE fkuserowner=$1`, [userId]);
    const accountInfo = await pool.query(`SELECT id, userfirstname, rating, registrationdate::varchar FROM Users WHERE id=$1`, [userId]);
    return [accountInfo.rows, countWorks.rows, countBWorks.rows, countOrders.rows]
}


module.exports = {
    createUserIfExist, addWork,
    getAddedWorks, editWork, getWorkInfo, deleteWork,
    getAccountInfo,
    addOrder, getAddedOrders, getOrderInfo, deleteOrder
};