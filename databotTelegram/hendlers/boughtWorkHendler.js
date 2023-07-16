const db = require("../databaseWork.js")
const { wordByCode } = require('../translate.js');
const { siteUrl } = require('../translate.js');

async function getBoughtWorkHendlers(msg, dataFromWeb) {
  var locale = wordByCode[msg.from.language_code];
  const fullBoughtWorkInfo = await db.getBoughtWorkInfo(dataFromWeb)
  var options = []
  var fileIds = []
  for (let i = 0; i < fullBoughtWorkInfo.length; i++) {
    options.push({
      reply_markup: JSON.stringify({
        keyboard: [
          [{ text: locale['Account'] }],
          [{ text: locale['WathCatalog'], web_app: { url: siteUrl + '/works' } }],
          [{ text: locale['AddWork'] }],
          [{ text: locale['AddedWorksList'] }],
          [{ text: locale['BoughtWorksList'] }]
        ],
        resize_keyboard: true
      }),
      parse_mode: 'HTML',
      caption: fullBoughtWorkInfo[i]['workname']
    })
    fileIds.push(fullBoughtWorkInfo[i]['fileid'])
  }
  return [options, fileIds]
}


async function getBoughtWorkInChat(msg) {
  var locale = wordByCode[msg.from.language_code];
  const workList = await db.getBoughtWorkInfoInChat(msg.from.id)
  var textToSend = locale['ChoiseBoughtWork']
  var buttons = []; var tmpButtons = [];
  var forLen = workList.length;
  for (let i = 1; i <= forLen; i++) {
    if (i % 2 == 0) {
      tmpButtons.push({ text: workList[i - 1].workname, callback_data: ('boughtWork' + workList[i - 1].id) })
      buttons.push(tmpButtons)
      tmpButtons = []
    }
    else {
      tmpButtons.push({ text: workList[i - 1].workname, callback_data: ('boughtWork' + workList[i - 1].id) })
    }
  }
  if (forLen % 2 == 1) {
    buttons.push([{ text: workList[forLen - 1].workname, callback_data: ('boughtWork' + workList[forLen - 1].id) }])
  }
  var options = {
    reply_markup: JSON.stringify({
      inline_keyboard: buttons,
      resize_keyboard: true
    })
  };
  return [textToSend, options]
}

async function showWorkInfo(userId, action, lenCode) {
  var locale = wordByCode[lenCode];
  var workId = Number(action.substring(10, action.length))
  const fullWorkInfo = await db.getOneBoughtWorkInfo(workId, userId)
  var textToSend = '';
  textToSend += '<b>' + locale['WorkName'] + '</b>: ' + fullWorkInfo[0].workname + '\n'
  textToSend += '<b>' + locale['WorkFirstCategory'] + '</b>: ' + fullWorkInfo[0].wtnf + '\n'
  textToSend += '<b>' + locale['WorkSecondCategory'] + '</b>: ' + fullWorkInfo[0].wtns + '\n'
  var tmpPrice = ''
  if (fullWorkInfo[0].price == 0) { tmpPrice = locale['WorkIsFree'] } else { tmpPrice = String(fullWorkInfo[0].price) }
  textToSend += '<b>' + locale['WorkPrice'] + '</b>: ' + tmpPrice + '\n'
  textToSend += '<b>' + locale['WorkAddDate'] + '</b>: ' + fullWorkInfo[0].adddate + '\n'
  textToSend += '<b>' + locale['WorkDescribtion'] + '</b>: ' + '\n'
  textToSend += fullWorkInfo[0].description
  var options = {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: locale['SetFeedback'] }],
        [{ text: locale['BoughtWorksList'] }],
        [{ text: locale['Back'] }],
      ],
      resize_keyboard: true
    }),
    parse_mode: 'HTML',
    caption: textToSend
  };
  return [options, true, fullWorkInfo[0].fileid, fullWorkInfo[0].workid]
}
function getTextAndOptionsSetFeedBack(msg) {
  var locale = wordByCode[msg.from.language_code];
  var options = {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: locale['Back'] }],
      ],
      resize_keyboard: true
    }),
    parse_mode: 'HTML',
    caption: textToSend
  };
  var textToSend = locale['SetFeedbackRaiting']
  return [textToSend, options]
}
function getTextAndOptionsSetFeedBackDone(msg) {
  var locale = wordByCode[msg.from.language_code];
  var options = {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: locale['BoughtWorksList']}],
        [{ text: locale['Back']}]
      ],
      resize_keyboard:true
    }),
  };
  var textToSend = locale['SetFeedbackDone']
  return [textToSend, options]
}

module.exports = { getBoughtWorkHendlers, getBoughtWorkInChat, showWorkInfo, getTextAndOptionsSetFeedBack, getTextAndOptionsSetFeedBackDone };