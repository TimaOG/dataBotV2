const { app } = require('./config.js');
const { pool } = require('./config.js');
const { server } = require('./config.js')
const process = require('process');

process.on('uncaughtException', function (err) {
    fs.appendFileSync('logs.txt', String(err) + '\n');
});


app.get('/health-check', (req, res) => res.sendStatus(200));

app.get('/', async (req, res) => {
    res.render("index.ejs")
});

app.get('/agreement', async (req, res) => {
    res.render("agreement.ejs")
});

app.get('/', async (req, res) => {
    res.render("confidentiality.ejs")
});

app.get('/works', async (req, res) => {
    const works = await pool.query('SELECT id, workName, price,description ,adddate::varchar from works order by id desc limit 20', []);
    const worksTypesFirst = await pool.query('SELECT id, worktypename from worktypefirst order by worktypename asc', []);
    const worksTypesSecond = await pool.query('SELECT id, worktypename, fkfirsttype from worktypesecond order by worktypename asc', []);
    const allCount = await pool.query('SELECT count(id) from works ', []);
    res.render("works.ejs", { works: works.rows, worksTypesFirst: worksTypesFirst.rows, worksTypesSecond: worksTypesSecond.rows, allCount: allCount.rows[0]['count'] })
});


app.get('/orders', async (req, res) => {
    const orders = await pool.query('SELECT id, orderName, price, description ,adddate::varchar from orders order by id desc limit 20', []);
    const worksTypesFirst = await pool.query('SELECT id, worktypename from worktypefirst order by worktypename asc', []);
    const worksTypesSecond = await pool.query('SELECT id, worktypename, fkfirsttype from worktypesecond order by worktypename asc', []);
    const allCount = await pool.query('SELECT count(id) from orders ', []);
    res.render("orders.ejs", { orders: orders.rows, worksTypesFirst: worksTypesFirst.rows, worksTypesSecond: worksTypesSecond.rows, allCount: allCount.rows[0]['count'] })
});


app.post('/works/getWorks/:page', async (req, res) => {
    const finalRes = getSqlRequestWorks(req.body, req.params.page)
    const answer = await pool.query(finalRes[0], finalRes[1]);
    res.send({ answer: answer.rows });
});

app.post('/orders/getOrders/:page', async (req, res) => {
    const finalRes = getSqlRequestOrders(req.body, req.params.page)
    const answer = await pool.query(finalRes[0], finalRes[1]);
    res.send({ answer: answer.rows });
});


app.get('/works/workInfo/:id', async (req, res) => {
    const workInfo = await pool.query(`SELECT w.id, w.workName, w.fkuserowner,
     w.description, w.price, w.filepath, u.username, wf.worktypename as wtnf, ws.worktypename as wtns, w.adddate::varchar
      from works as w LEFT JOIN worktypefirst as wf on wf.id = w.fkworktypefirst 
      LEFT JOIN worktypesecond as ws on ws.id = w.fkworktypesecond LEFT JOIN Users as u 
      on u.id = w.fkuserowner where w.id = $1`, [req.params.id]);
    const workTags = await pool.query('SELECT tagname from worktags where fkWork = $1 ', [req.params.id]);
    res.send({ workInfo: workInfo.rows, workTags: workTags.rows });

});

app.get('/orders/orderInfo/:id', async (req, res) => {
    const orderInfo = await pool.query(`SELECT o.id, o.orderName, o.fkuserowner,
     o.description, o.price, u.username, wf.worktypename as wtnf, ws.worktypename as wtns, o.adddate::varchar
      from orders as o LEFT JOIN worktypefirst as wf on wf.id = o.fkworktypefirst 
      LEFT JOIN worktypesecond as ws on ws.id = o.fkworktypesecond LEFT JOIN Users as u 
      on u.id = o.fkuserowner where o.id = $1`, [req.params.id]);
    const orderTags = await pool.query('SELECT tagname from ordertags where fkWork = $1 ', [req.params.id]);
    res.send({ orderInfo: orderInfo.rows, orderTags: orderTags.rows });

});

app.get('/works/editWork/:id', async (req, res) => {
    const workInfo = await pool.query(`SELECT id, workName, isfree, description, price, fkworktypefirst, fkworktypesecond
      from works where id = $1`, [req.params.id]);
    const workTags = await pool.query('SELECT tagname from worktags where fkWork = $1 ', [req.params.id]);
    const worksTypesFirst = await pool.query('SELECT id, worktypename from worktypefirst ', []);
    const worksTypesSecond = await pool.query('SELECT id, worktypename, fkfirsttype from worktypesecond ', []);
    res.render("editWork.ejs", { workInfo: workInfo.rows[0], workTags: workTags.rows, worksTypesFirst: worksTypesFirst.rows, worksTypesSecond: worksTypesSecond.rows })

});

app.get('/works/addWork', async (req, res) => {
    const worksTypesFirst = await pool.query('SELECT id, worktypename from worktypefirst ', []);
    const worksTypesSecond = await pool.query('SELECT id, worktypename, fkfirsttype from worktypesecond ', []);
    res.render("addWork.ejs", { worksTypesFirst: worksTypesFirst.rows, worksTypesSecond: worksTypesSecond.rows })
});

app.get('/orders/addOrder', async (req, res) => {
    const worksTypesFirst = await pool.query('SELECT id, worktypename from worktypefirst ', []);
    const worksTypesSecond = await pool.query('SELECT id, worktypename, fkfirsttype from worktypesecond ', []);
    res.render("addOrder.ejs", { worksTypesFirst: worksTypesFirst.rows, worksTypesSecond: worksTypesSecond.rows })
});


server.listen(3000, 'allworksbot.localhost', () => {
    console.log('Server started on https://allworksbot.localhost:3000/works');
});
// app.listen(3000)
// server.listen(3000, '192.168.1.96',() => {
//     console.log('Server started on https://192.168.1.96:3000/works');
// });


function getSqlRequestWorks(requst, pageNumber) {
    pageNumber -= 1
    var iter = 1
    var argArr = []
    var startReq = `SELECT w.id, w.workName, w.price, w.description,w.adddate::varchar FROM works
     AS w LEFT JOIN worktags AS wt ON wt.fkwork = w.id WHERE w.id IS NOT NULL`
    if (requst.workName !== '') {
        startReq += ` AND w.workname like '%${requst.workName}%'`
    } else {
        startReq += ' AND w.workname IS NOT NULL'
    }
    if (requst.firstCategory !== '0') {
        startReq += ` AND w.fkworktypefirst = $${iter}`
        argArr.push(requst.firstCategory)
        iter += 1
    } else {
        startReq += ' AND w.fkworktypefirst IS NOT NULL'
    }
    if (requst.secondCategory !== '0') {
        startReq += ` AND w.fkworktypesecond = $${iter}`
        argArr.push(requst.secondCategory)
        iter += 1
    } else {
        startReq += ' AND w.fkworktypesecond IS NOT NULL'
    }
    if (requst.isFree) {
        startReq += ` AND w.isFree = $${iter}`
        argArr.push(requst.isFree)
        iter += 1
    } else {
        startReq += ' AND w.isFree IS NOT NULL'
    }
    if (requst.priceTo !== '0') {
        startReq += ` AND w.price <= $${iter}`
        argArr.push(requst.priceTo)
        iter += 1
    } else {
        startReq += ' AND w.price IS NOT NULL'
    }
    startReq += (' AND wt.tagname ' + ((requst.tags !== 'null') ? `IN (${createInArr(requst.tags)})` : 'IS NOT NULL'))
    startReq += ` group by w.id order by w.id desc LIMIT 20 OFFSET ` + String(pageNumber * 20)
    return [startReq, argArr]
}

function getSqlRequestOrders(requst, pageNumber) {
    pageNumber -= 1
    var iter = 1
    var argArr = []
    var startReq = `SELECT o.id, o.orderName, o.price, o.description, o.adddate::varchar FROM orders
     AS o LEFT JOIN ordertags AS wt ON wt.fkwork = o.id WHERE o.id IS NOT NULL`
    if (requst.workName !== '') {
        startReq += ` AND o.ordername like '%${requst.workName}%'`
    } else {
        startReq += ' AND o.ordername IS NOT NULL'
    }
    if (requst.firstCategory !== '0') {
        startReq += ` AND o.fkworktypefirst = $${iter}`
        argArr.push(requst.firstCategory)
        iter += 1
    } else {
        startReq += ' AND o.fkworktypefirst IS NOT NULL'
    }
    if (requst.secondCategory !== '0') {
        startReq += ` AND o.fkworktypesecond = $${iter}`
        argArr.push(requst.secondCategory)
        iter += 1
    } else {
        startReq += ' AND o.fkworktypesecond IS NOT NULL'
    }
    if (requst.priceTo !== '0') {
        startReq += ` AND o.price >= $${iter}`
        argArr.push(requst.priceTo)
        iter += 1
    } else {
        startReq += ' AND o.price IS NOT NULL'
    }
    startReq += (' AND wt.tagname ' + ((requst.tags !== 'null') ? `IN (${createInArr(requst.tags)})` : 'IS NOT NULL'))
    startReq += ` group by o.id order by o.id desc LIMIT 20 OFFSET ` + String(pageNumber * 20)
    return [startReq, argArr]
}

function createInArr(inArr) {
    var inArrRes = ""
    for (let i = 0; i < inArr.length; i++) {
        if (i != 0) {
            inArrRes += ",'" + inArr[i] + "'"
        } else {
            inArrRes += "'" + inArr[i] + "'"
        }
    }
    return inArrRes
}