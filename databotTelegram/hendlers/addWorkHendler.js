const db = require("../databaseWork.js")
const { wordByCode } = require('../translate.js');
const { siteUrl } = require('../translate.js');
const keyboards = require('../keyboards.js');

function addWorkHendlers(msg) {
  var locale = wordByCode['ru'];
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

function addOrderHendlers(msg) {
  var locale = wordByCode['ru'];
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

module.exports = { addWorkHendlers, addOrderHendlers};