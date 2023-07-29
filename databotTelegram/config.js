const { Pool } = require('pg')
const pool = new Pool({
    user: "postgres",
    database: "bot",
    password: "root",
    port: 5432,
    host: "127.0.0.1",
});

const siteUrl = 'https://allworksbot.localhost:3000'
const token = '6134658081:AAGbJbKVwWxtpuC8lE22AIVS-CEzUbc_SKE';

module.exports = {pool: pool, siteUrl: siteUrl, token: token};