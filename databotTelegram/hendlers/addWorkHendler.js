const db = require("../databaseWork.js")
const { wordByCode } = require('../translate.js');
const { siteUrl } = require('../translate.js');

function addWorkHendlers(msg) {
  var locale = wordByCode[msg.from.language_code];
  var textToSend = locale['ChoiseActionWork']
  var options = {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: locale['EnterDescribtion'], web_app: { url: siteUrl + '/works/addWork' } }],
        [{ text: locale['Back'] }],
      ],
      resize_keyboard: true
    })
  };
  return [textToSend, options]
}
function saveWork(msg, userWorkInfo) {
  var locale = wordByCode[msg.from.language_code];
  var textToSend = locale['StartMessage']
  var options = {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: locale['Account'] }],
        [{ text: locale['WathCatalog'], web_app: { url: siteUrl + '/works' } }, { text: locale['WathCatalogOrders'], web_app: { url: siteUrl + '/orders' } }],
        [{ text: locale['AddWork'] }, { text: locale['AddOrder'] }],
        [{ text: locale['AddedWorksList'] }, { text: locale['AddedOrdersList'] }],
        [{ text: locale['BoughtWorksList'] }],
      ],
      resize_keyboard: true
    })
  };
  db.addWork(userWorkInfo, msg.document.file_id)
  return [textToSend, options]
}

function addOrderHendlers(msg) {
  var locale = wordByCode[msg.from.language_code];
  var textToSend = locale['ChoiseAction']
  var options = {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: locale['EnterDescribtion'], web_app: { url: siteUrl + '/orders/addOrder' } }],
        [{ text: locale['Back'] }],
      ],
      resize_keyboard: true
    })
  };
  return [textToSend, options]
}

function saveOrder(msg, userOrderInfo) {
  var locale = wordByCode[msg.from.language_code];
  var textToSend = locale['OrderHaveAdded']
  var options = {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: locale['Account'] }],
        [{ text: locale['WathCatalog'], web_app: { url: siteUrl + '/works' } }, { text: locale['WathCatalogOrders'], web_app: { url: siteUrl + '/orders' } }],
        [{ text: locale['AddWork'] }, { text: locale['AddOrder'] }],
        [{ text: locale['AddedWorksList'] }, { text: locale['AddedOrdersList'] }],
        [{ text: locale['BoughtWorksList'] }],
      ],
      resize_keyboard: true
    })
  };
  db.addOrder(userOrderInfo)
  return [textToSend, options]
}



module.exports = { addWorkHendlers, saveWork, addOrderHendlers, saveOrder };