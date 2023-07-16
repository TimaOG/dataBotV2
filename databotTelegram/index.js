const TelegramBot = require('node-telegram-bot-api');
const db = require("./databaseWork.js")
const { wordByCode } = require('./translate.js');
const hendlerAddWork = require('./hendlers/addWorkHendler.js')
const hendlerAccount = require('./hendlers/accountHendler.js')
const hendlerAddedWork = require('./hendlers/addedWorkHendler.js')
const hendlerBoughtWork = require('./hendlers/boughtWorkHendler.js')
const hendlerStartAndOther = require('./hendlers/startAndOtherHendler.js')
const request = require('request');
const token = '6134658081:AAGbJbKVwWxtpuC8lE22AIVS-CEzUbc_SKE';

function clearUpdates() {
  request.get(`https://api.telegram.org/bot${token}/getUpdates`, { json: true }, (err, res, body) => {
    try {
      if (body.result.length !== 0) {
        var offset = body.result[body.result.length -1].update_id + 1
        request.get(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}`, { json: true }, (err, res, body1) => {});
      }
    } catch {}
  });
}
clearUpdates()
const bot = new TelegramBot(token, { polling: true, skip_updates: true });

setInterval(() => {
  db.deleteWorkFromDelete()
}, 1000 * 60 * 60)

var users = new Map()
setInterval(() => {
  users.clear()
}, 1000 * 60)
function throttler(waitTime) {
  return (chatId) => {
     const now = parseInt(Date.now()/1000)
     const hitTime = users.get(chatId)
     if (hitTime) {
       const diff = now - hitTime
       if (diff < waitTime) {
         return false
       } 
       users.set(chatId, now)
       return true
     }
     users.set(chatId, now)
     return true
  }
}
const throttle = throttler(0.5)
var userFilesArray = {}
var currentWorkArray = {}
var currentOrderArray = {}
var cardNumbersStates = {}
var currentBoughtArray = {}
var currentBoughtArrayToFeedBack = {}

bot.on('message', async (msg) => {
  var locale = wordByCode[msg.from.language_code];
  if (!throttle(msg.chat.id)) {
    bot.sendMessage(msg.chat.id, locale['StopSpam'])
    return
  }
  var textToSend = '';
  var options = null;
  var optionsList = []
  var fileIds = []
  var isSendBoughtFiles = false
  if (msg.text == '/start' || msg.text == locale['Back']) {
    delete userFilesArray[msg.from.id]
    delete currentWorkArray[msg.from.id]
    delete currentOrderArray[msg.from.id]
    delete cardNumbersStates[msg.from.id]
    delete currentBoughtArray[msg.from.id]
    delete currentBoughtArrayToFeedBack[msg.from.id]
    const res = hendlerStartAndOther.startAndOtherHendlers(msg)
    textToSend = res[0]; options = res[1]
  }
  else if (msg.text == locale['Account']) {
    const res = await hendlerAccount.accountHendlers(msg);
    textToSend = res[0]; options = res[1]
  }
  else if (msg.text == locale['AddWork']) {
    const res = hendlerAddWork.addWorkHendlers(msg)
    textToSend = res[0]; options = res[1]
  }
  else if (msg.text == locale['AddOrder']) {
    const res = hendlerAddWork.addOrderHendlers(msg)
    textToSend = res[0]; options = res[1]
  }
  else if (msg.text == locale['AddedWorksList']) {
    const res = await hendlerAddedWork.addedWorkHendlers(msg)
    textToSend = res[0]; options = res[1]
  }
  else if (msg.text == locale['BoughtWorksList']) {
    const res = await hendlerBoughtWork.getBoughtWorkInChat(msg)
    textToSend = res[0]; options = res[1]
  }
  else if (msg.text == locale['AddedOrdersList']) {
    const res = await hendlerAddedWork.addedOrderHendlers(msg)
    textToSend = res[0]; options = res[1]
  }
  else if (msg.text == locale['DeleteWork'] && msg.from.id in currentWorkArray) {
    db.deleteWork(currentWorkArray[msg.from.id])
    delete currentWorkArray[msg.from.id]
    res = hendlerAddedWork.getTextAndOptionsDel(msg)
    textToSend = res[0]; options = res[1]
  }
  else if (msg.text == locale['DeleteOrder'] && msg.from.id in currentWorkArray) {
    db.deleteOrder(currentOrderArray[msg.from.id])
    delete currentWorkArray[msg.from.id]
    res = hendlerAddedWork.getTextAndOptionsDelOrder(msg)
    textToSend = res[0]; options = res[1]
  }
  else if (msg.text == locale['SetFeedback'] && msg.from.id in currentBoughtArray) {
    currentBoughtArrayToFeedBack[msg.from.id] = currentBoughtArray[msg.from.id]
    delete currentBoughtArray[msg.from.id]
    res = hendlerBoughtWork.getTextAndOptionsSetFeedBack(msg)
    textToSend = res[0]; options = res[1]
  }
  else if (msg.from.id in currentBoughtArrayToFeedBack) {
    db.setRaitingToWork(currentBoughtArrayToFeedBack[msg.from.id], msg.text, msg.from.id)
    delete currentBoughtArrayToFeedBack[msg.from.id]
    res = hendlerBoughtWork.getTextAndOptionsSetFeedBackDone(msg)
    textToSend = res[0]; options = res[1]
  }
  else if (msg.text == locale['SetCardNumber']) {
    cardNumbersStates[msg.from.id] = true
    res = hendlerAccount.getSetCardNumbers(msg)
    textToSend = res[0]; options = res[1]
  }
  else if (msg.from.id in cardNumbersStates) {
    res = hendlerAccount.saveCardNumber(msg)
    textToSend = res[0]; options = res[1]; var success = res[2]
    if (success) { delete cardNumbersStates[msg.from.id] }
  }
  else if (msg?.web_app_data?.data) {
    var dataFromWeb = JSON.parse(msg?.web_app_data?.data);
    dataFromWeb.userId = msg.from.id
    if (dataFromWeb['action'] == 'addWork') {
      textToSend = locale['AddFile']
      options = {}
      userFilesArray[msg.from.id] = dataFromWeb
    }
    else if (dataFromWeb['action'] == 'editWork') {
      db.editWork(dataFromWeb)
      delete currentWorkArray[msg.from.id]
      res = hendlerAddedWork.getTextAndOptions(msg)
      textToSend = res[0]; options = res[1]
    }
    else if (dataFromWeb['action'] == 'addOrder') {
      res = hendlerAddWork.saveOrder(msg, dataFromWeb)
      textToSend = res[0]; options = res[1]
    }
    else if (dataFromWeb['action'] == 'getWorks') {
      var isCan = await db.checkWorksForOwners(dataFromWeb)
      if (isCan) {
        isSendBoughtFiles = true
        res = await hendlerBoughtWork.getBoughtWorkHendlers(msg, dataFromWeb)
        fileIds = res[1]; optionsList = res[0]
      }
      else {
        textToSend = locale['CantBuySelfWors']; options = {}
      }
    }
  }
  else if (msg?.document && msg?.document && (msg.from.id in userFilesArray)) {
    const res = hendlerAddWork.saveWork(msg, userFilesArray[msg.from.id])
    textToSend = res[0]; options = res[1]
    delete userFilesArray[msg.from.id]
  }
  else {
    textToSend = locale['Unknown']; options = {}
  }
  if (!isSendBoughtFiles) {
    try {
      bot.sendMessage(msg.chat.id, textToSend, options);
    } catch (err) {
      console.log(err)
    }
  }
  else {
    for (let i = 0; i < optionsList.length; i++) {
      try {
        bot.sendDocument(msg.chat.id, fileIds[i], optionsList[i])
      } catch (err) {
        console.log(err)
      }
    }
  }
});

bot.on("callback_query", async function (callbackQuery) {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const lenCode = callbackQuery.from.language_code
  var isSendfile = false
  var fileId = ''
  if (/addedWork/.test(action)) {
    const res = await hendlerAddedWork.showWorkInfo(msg, action, lenCode)
    options = res[0]; isSendfile = res[1]; fileId = res[2]
    currentWorkArray[callbackQuery.from.id] = res[3]
  }
  else if (/addedOrder/.test(action)) {
    const res = await hendlerAddedWork.showOrderInfo(msg, action, lenCode)
    textToSend = res[0]; options = res[1]
    currentOrderArray[callbackQuery.from.id] = res[2]
  }
  else if (/boughtWork/.test(action)) {
    const res = await hendlerBoughtWork.showWorkInfo(callbackQuery.from.id, action, lenCode)
    options = res[0]; isSendfile = res[1]; fileId = res[2]
    currentBoughtArray[callbackQuery.from.id] = res[3]
  }
  if (isSendfile) {
    try {
      bot.sendDocument(msg.chat.id, fileId, options)
    } catch (err) {
      console.log(err)
    }
  }
  else {
    try {
      bot.sendMessage(msg.chat.id, textToSend, options);
    } catch (err) {
      console.log(err)
    }
  }
});

