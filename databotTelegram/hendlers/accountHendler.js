const db = require("../databaseWork.js")
const {wordByCode} = require('../translate.js'); 
const {siteUrl} = require('../translate.js'); 

async function accountHendlers(msg) {
    var locale = wordByCode[msg.from.language_code];
    const accountInfo = await db.getAccountInfo(msg.from.id)
    var textToSend = '<b>' + locale['YourId'] + "</b> - " + accountInfo[0][0]['id'] + "\n";
    textToSend += '<b>' + locale['YourName'] + "</b> - " + accountInfo[0][0]['userfirstname'] + "\n";
    textToSend += '<b>' + locale['YourBalance'] + "</b> - " + accountInfo[0][0]['balance'] + "\n"
    textToSend += '<b>' + locale['YourRating'] + "</b> - " + accountInfo[0][0]['rating'] + "\n"
    textToSend += '<b>' + locale['YourRegDate'] + "</b> - " + accountInfo[0][0]['registrationdate'] + "\n"
    textToSend += '<b>' + locale['YourCardNumber'] + "</b> - " + accountInfo[0][0]['cardnumber'] + "\n"
    textToSend += '<b>' + locale['AddedOrdersList'] + "</b> - " + accountInfo[3][0]['count'] + "\n"
    textToSend += '<b>' + locale['CountOfAddedWorks'] + "</b> - " + accountInfo[1][0]['count'] + "\n"
    textToSend += '<b>' + locale['CountOfBoughtWorks'] + "</b> - " + accountInfo[2][0]['count'] + "\n"
    var options = {
      reply_markup: JSON.stringify({
        keyboard: [
          [{ text: locale['SetCardNumber'] }],
          [{ text: locale['WithdrawalOfFunds'], web_app: {url: siteUrl + '/works'} }],
          [{ text: locale['Back']}],
        ],
        resize_keyboard:true
      }),
      parse_mode:"HTML"
    };
    return [textToSend, options]
}

function getSetCardNumbers(msg) {
  var locale = wordByCode[msg.from.language_code];
  var textToSend = locale['EnterCardNumber']
  var options = {}
  return [textToSend, options]
}

function saveCardNumber(msg) {
  var locale = wordByCode[msg.from.language_code];
  var textToSend = ''
  var success = false
  if(!isNaN(msg.text.replaceAll(' ',''))) {
    textToSend = locale['CardAddedSuccess']
    db.saveCardNumber(Number(msg.text.replaceAll(' ','')), msg.from.id)
    success = true
  } else {
    textToSend = locale['CardAddedFatal']
  }
  var options = {}
  return [textToSend, options, success]
}

module.exports = { accountHendlers, getSetCardNumbers, saveCardNumber };