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

async function addWork(workInfo, file_id) {
    const workIdArr = await pool.query(`INSERT INTO Works (workName, fkuserowner, description,
        price, fkworktypefirst, fkworktypesecond, isfree, cansendmessage, fileId, adddate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()) RETURNING id`,
        [workInfo.workName, workInfo.userId, workInfo.workDiscribtion, workInfo.workPrice, workInfo.firstCategory,
        workInfo.secondCategory, workInfo.isFree, workInfo.isCanWrite, file_id])
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
    fkworktypefirst = $4, fkworktypesecond = $5, isfree = $6, cansendmessage=$7 WHERE id = $8 AND fkuserowner = $9`,
        [workInfo.workName, workInfo.workDiscribtion, workInfo.workPrice, workInfo.firstCategory,
        workInfo.secondCategory, workInfo.isFree, workInfo.isCanWrite, workInfo.id, workInfo.userId])
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

async function addDocumentToWork(workId, fileId) {
    pool.query("UPDATE Works SET fileId = $1 WHERE id = $2", [fileId, workId])
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

async function saveCardNumber(cardNumber, userId) {
    pool.query(`UPDATE Users SET cardnumber = $1 WHERE id = $2`, [cardNumber, userId]);
}

async function getAccountInfo(userId) {
    const countWorks = await pool.query(`SELECT count(id) FROM Works WHERE fkuserowner=$1`, [userId]);
    const countOrders = await pool.query(`SELECT count(id) FROM Orders WHERE fkuserowner=$1`, [userId]);
    const countBWorks = await pool.query(`SELECT count(id) FROM boughtworks WHERE fkuserowner=$1`, [userId]);
    const accountInfo = await pool.query(`SELECT id, userfirstname, rating,
    balance, registrationdate::varchar, cardnumber FROM Users WHERE id=$1`, [userId]);
    return [accountInfo.rows, countWorks.rows, countBWorks.rows, countOrders.rows]
}

async function getBoughtWorkInfo(dataFromWeb) {
    var countWorksInfo = {}; countWorksInfo.rows = []
    if (dataFromWeb.works.length != 0 && dataFromWeb.works.length == 1) {
        countWorksInfo = await pool.query(`SELECT workName, fileid FROM Works WHERE id IN (` + dataFromWeb.works.join(',') + `) AND fkuserowner != $1;`, [dataFromWeb.userId]);
    } else if (dataFromWeb.works.length != 0) {
        countWorksInfo = await pool.query(`SELECT workName, fileid FROM Works WHERE id=$1 AND fkuserowner != $2`, [dataFromWeb.works[0], dataFromWeb.userId]);
    }
    for (let i = 0; i < dataFromWeb.works.length; i++) {
        const countWorks = await pool.query(`SELECT count(id) FROM Works WHERE id=$1`, [dataFromWeb.works[i]]);
        if (countWorks.rows[0]['count'] != 1) {
            pool.query(`INSERT INTO boughtworks (workname,fkuserowner,description,price,
                fkworktypefirst,fkworktypesecond,
                fileid,adddate, workid, issetfeedback) SELECT workname,$1,description,price,
                fkworktypefirst,fkworktypesecond,
                fileid,adddate, $2, false FROM worksdelete WHERE workid=$3 AND fkuserowner != $4`, [dataFromWeb.userId, dataFromWeb.works[i], dataFromWeb.works[i], dataFromWeb.userId]);
        } else {
            pool.query(`INSERT INTO boughtworks (workname,fkuserowner,description,price,
                fkworktypefirst,fkworktypesecond,
                fileid,adddate, workid, issetfeedback) SELECT workname,$1,description,price,
                fkworktypefirst,fkworktypesecond,
                fileid,adddate, $2, false FROM Works WHERE id=$3 AND fkuserowner != $4`, [dataFromWeb.userId, dataFromWeb.works[i], dataFromWeb.works[i], dataFromWeb.userId]);
        }
    }
    return countWorksInfo.rows
}

async function checkWorksForOwners(dataFromWeb) {
    var countWorksInfo = {}; countWorksInfo.rows = [];
    var countWorksB = {}; countWorksB.rows = [];
    if (dataFromWeb.works.length != 0 && dataFromWeb.works.length != 1) {
        countWorksInfo = await pool.query(`SELECT count(*) FROM Works WHERE id IN (` + dataFromWeb.works.join(',') + `) AND fkuserowner = $1;`, [dataFromWeb.userId]);
        countWorksB = await pool.query(`SELECT count(*) FROM boughtworks WHERE workid IN (` + dataFromWeb.works.join(',') + `) AND fkuserowner = $1;`, [dataFromWeb.userId]);
    } else if (dataFromWeb.works.length != 0) {
        countWorksInfo = await pool.query(`SELECT count(*) FROM Works WHERE id=$1 AND fkuserowner = $2`, [dataFromWeb.works[0], dataFromWeb.userId]);
        countWorksB = await pool.query(`SELECT count(*) FROM boughtworks WHERE workid=$1 AND fkuserowner = $2`, [dataFromWeb.works[0], dataFromWeb.userId]);
    }
    if (countWorksInfo.rows[0]['count'] != 0 || countWorksB.rows[0]['count'] != 0) {
        return false
    }
    return true
}

async function getBoughtWorkInfoInChat(userId) {
    const boughtWorksList = await pool.query(`SELECT id, workname FROM boughtworks WHERE fkuserowner=$1`, [userId]);
    return boughtWorksList.rows
}

async function getOneBoughtWorkInfo(workId, userId) {
    const workInfo = await pool.query(`SELECT w.workName,
     w.description, w.price, w.fileid, w.workid,wf.worktypename as wtnf, ws.worktypename as wtns, w.adddate::varchar
      from boughtworks as w LEFT JOIN worktypefirst as wf on wf.id = w.fkworktypefirst 
      LEFT JOIN worktypesecond as ws on ws.id = w.fkworktypesecond where w.id = $1 and w.fkuserowner = $2`, [workId, userId]);
    return workInfo.rows
}

async function deleteWorkFromDelete() {
    await pool.query(`DELETE FROM worksdelete WHERE deletetime < (NOW() - INTERVAL '1 hour')`, [])
}

async function setRaitingToWork(workId, rating, userId) {
    try {
        var n = Number(rating)
        if (n >= 1 && n <= 5) {
            pool.query(`call update_work_rating($1,$2,$3)`, [workId, rating, userId])
        }
    } catch { }
}

module.exports = {
    createUserIfExist, addWork, addDocumentToWork,
    getAddedWorks, editWork, getWorkInfo, deleteWork, saveCardNumber,
    getAccountInfo, getBoughtWorkInfo, getBoughtWorkInfoInChat, getOneBoughtWorkInfo,
    addOrder, getAddedOrders, getOrderInfo, deleteOrder,
    checkWorksForOwners, deleteWorkFromDelete, setRaitingToWork
};