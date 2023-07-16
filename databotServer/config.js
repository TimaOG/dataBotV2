const express = require('express');
const fs = require('fs');
const https = require('https');
const { Pool } = require('pg')
const app = express();

const key = fs.readFileSync('server.key');

const cert = fs.readFileSync('server.cert');
const server = https.createServer({key: key, cert: cert }, app);
const pool = new Pool({
    user: "postgres",
    database: "bot",
    password: "root",
    port: 5432,
    host: "127.0.0.1",
});  

pool.connect();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');

module.exports = {app: app, pool: pool, server: server};
  