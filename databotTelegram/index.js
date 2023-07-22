const TelegramBot = require('node-telegram-bot-api');
const db = require("./databaseWork.js")
const { wordByCode } = require('./translate.js');
fs = require('fs');
const keyboards = require('./keyboards.js');
const hendlerAddWork = require('./hendlers/addWorkHendler.js')
const hendlerAccount = require('./hendlers/accountHendler.js')
const hendlerAddedWork = require('./hendlers/addedWorkHendler.js')
const request = require('request');
const token = '6134658081:AAGbJbKVwWxtpuC8lE22AIVS-CEzUbc_SKE';

function clearUpdates() {
  request.get(`https://api.telegram.org/bot${token}/getUpdates`, { json: true }, (err, res, body) => {
    try {
      if (body.result.length !== 0) {
        var offset = body.result[body.result.length - 1].update_id + 1
        request.get(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}`, { json: true }, (err, res, body1) => { });
      }
    } catch { }
  });
}
clearUpdates()
const bot = new TelegramBot(token, { polling: true, skip_updates: true });


var users = new Map()
setInterval(() => {
  users.clear()
}, 1000 * 60)
function throttler(waitTime) {
  return (chatId) => {
    const now = parseInt(Date.now() / 1000)
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
var currentWorkArray = {}
var currentOrderArray = {}
var userFilesArray = {}

bot.on('message', async (msg) => {
  var locale = wordByCode[msg.from.language_code];
  if (!throttle(msg.chat.id)) {
    bot.sendMessage(msg.chat.id, locale['StopSpam'])
    return
  }
  var textToSend = '';
  var options = null;
  if (msg.text == '/start' || msg.text == locale['Back']) {
    delete currentWorkArray[msg.from.id]
    delete currentOrderArray[msg.from.id]
    delete userFilesArray[msg.from.id]
    db.createUserIfExist(msg.from.first_name, msg.from.id, msg.from.username);
    textToSend = locale['StartMessage']; options = keyboards.getKeyboard('startBoard', msg.from.language_code)
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
  else if (msg.text == locale['AddedOrdersList']) {
    const res = await hendlerAddedWork.addedOrderHendlers(msg)
    textToSend = res[0]; options = res[1]
  }
  else if (msg.text == locale['DeleteWork'] && msg.from.id in currentWorkArray) {
    db.deleteWork(currentWorkArray[msg.from.id])
    delete currentWorkArray[msg.from.id]
    options = keyboards.getKeyboard('startBoard', msg.from.language_code)
    textToSend = locale['DeleteHaveDone']
  }
  else if (msg.text == locale['DeleteOrder'] && msg.from.id in currentOrderArray) {
    db.deleteOrder(currentOrderArray[msg.from.id])
    delete currentOrderArray[msg.from.id]
    options = keyboards.getKeyboard('startBoard', msg.from.language_code)
    textToSend = locale['DeleteHaveDone']
  }
  else if (msg?.web_app_data?.data) {
    var dataFromWeb = JSON.parse(msg?.web_app_data?.data);
    dataFromWeb.userId = msg.from.id
    if (dataFromWeb['action'] == 'addWork') {
      userFilesArray[msg.from.id] = await db.addWork(dataFromWeb)
      textToSend = locale['WorkHaveAdd']
      options = keyboards.getKeyboard('addWorkBoard', msg.from.language_code)
    }
    else if (dataFromWeb['action'] == 'editWork') {
      db.editWork(dataFromWeb)
      delete currentWorkArray[msg.from.id]
      options = keyboards.getKeyboard('startBoard', msg.from.language_code)
      textToSend = locale['EditHaveDone']
    }
    else if (dataFromWeb['action'] == 'addOrder') {
      db.addOrder(dataFromWeb)
      textToSend = locale['OrderHaveAdd']
      options = keyboards.getKeyboard('startBoard', msg.from.language_code)
    }
  }
  else if (msg.photo && msg.photo[0] && (msg.from.id in userFilesArray)) {
    textToSend = locale['Save']
    options = keyboards.getKeyboard('startBoard', msg.from.language_code)
    var df = bot.downloadFile(msg.photo[0].file_id, "upload/")
    df.then((realPath) => {
      db.savePhotoPathToWork(realPath, userFilesArray[msg.from.id])
      console.log(realPath);
    });
    delete userFilesArray[msg.from.id]
  }
  else {
    textToSend = locale['Unknown']; options = {}
  }
  try {
    bot.sendMessage(msg.chat.id, textToSend, options);
  } catch (err) {
    console.log(err)
  }
});

bot.on("callback_query", async function (callbackQuery) {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const lenCode = callbackQuery.from.language_code
  var options; var textToSend;
  if (/addedWork/.test(action)) {
    const res = await hendlerAddedWork.showWorkInfo(action, lenCode)
    options = res[1]; textToSend = res[0]
    currentWorkArray[callbackQuery.from.id] = res[3]
  }
  else if (/addedOrder/.test(action)) {
    const res = await hendlerAddedWork.showOrderInfo(action, lenCode)
    textToSend = res[0]; options = res[1]
    currentOrderArray[callbackQuery.from.id] = res[2]
  }
  try {
    bot.sendMessage(msg.chat.id, textToSend, options);
  } catch (err) {
    console.log(err)
  }
});

