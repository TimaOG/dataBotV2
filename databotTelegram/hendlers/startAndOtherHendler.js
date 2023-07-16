const db = require("../databaseWork.js")
const {wordByCode} = require('../translate.js');
const {siteUrl} = require('../translate.js'); 

function startAndOtherHendlers(msg) {
    var locale = wordByCode[msg.from.language_code];
    db.createUserIfExist(msg.from.first_name, msg.from.id, msg.from.username);
    var textToSend = locale['StartMessage']
    var options = {
      reply_markup: JSON.stringify({
        keyboard: [
          [{ text: locale['Account']}],
          [{ text: locale['WathCatalog'], web_app: {url: siteUrl + '/works'} }, { text: locale['WathCatalogOrders'], web_app: {url: siteUrl + '/orders'} }],
          [{ text: locale['AddWork']}, { text: locale['AddOrder']}],
          [{ text: locale['AddedWorksList']}, { text: locale['AddedOrdersList']}],
          [{ text: locale['BoughtWorksList']}],
        ],
        resize_keyboard:true
      })
    };
    return [textToSend, options]
}

module.exports = { startAndOtherHendlers };