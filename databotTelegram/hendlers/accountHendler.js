const db = require("../databaseWork.js")
const { wordByCode } = require('../translate.js');
const keyboards = require('../keyboards.js');

async function accountHendlers(msg) {
  var locale = wordByCode[msg.from.language_code];
  const accountInfo = await db.getAccountInfo(msg.from.id)
  var textToSend = '<b>' + locale['YourId'] + "</b> - " + accountInfo[0][0]['id'] + "\n";
  textToSend += '<b>' + locale['YourName'] + "</b> - " + accountInfo[0][0]['userfirstname'] + "\n";
  textToSend += '<b>' + locale['YourRegDate'] + "</b> - " + accountInfo[0][0]['registrationdate'] + "\n"
  textToSend += '<b>' + locale['AddedOrdersList'] + "</b> - " + accountInfo[2][0]['count'] + "\n"
  textToSend += '<b>' + locale['CountOfAddedWorks'] + "</b> - " + accountInfo[1][0]['count'] + "\n"
  var options = keyboards.getKeyboard('startBoard', msg.from.language_code)
  return [textToSend, options]
}


module.exports = { accountHendlers };