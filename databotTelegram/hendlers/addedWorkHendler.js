const db = require("../databaseWork.js")
const {wordByCode} = require('../translate.js');
const {siteUrl} = require('../translate.js');  

async function addedWorkHendlers(msg) {
    var locale = wordByCode[msg.from.language_code];
    const workList = await db.getAddedWorks(msg.from.id)
    var textToSend = locale['ChoiseAddedWork']
    var buttons = []; var tmpButtons = [];
    var forLen = workList.length;
    for(let i=1; i <= forLen; i++) {
      if(i % 2 == 0) {
        tmpButtons.push({text: workList[i-1].workname, callback_data: ('addedWork' + workList[i-1].id)})
        buttons.push(tmpButtons)
        tmpButtons = []
      }
      else {
        tmpButtons.push({text: workList[i-1].workname, callback_data: ('addedWork' + workList[i-1].id)})
      }
    }
    if(forLen % 2 == 1) {
      buttons.push([{text: workList[forLen-1].workname, callback_data: ('addedWork' + workList[forLen-1].id)}])
    }
    var options = {
      reply_markup: JSON.stringify({
        inline_keyboard: buttons,
        resize_keyboard:true
      })
    };
    return [textToSend, options]
}

async function addedOrderHendlers(msg) {
  var locale = wordByCode[msg.from.language_code];
  const workList = await db.getAddedOrders(msg.from.id)
  var textToSend = locale['ChoiseAddedOrder']
  var buttons = []; var tmpButtons = [];
  var forLen = workList.length;
  for(let i=1; i <= forLen; i++) {
    if(i % 2 == 0) {
      tmpButtons.push({text: workList[i-1].ordername, callback_data: ('addedOrder' + workList[i-1].id)})
      buttons.push(tmpButtons)
      tmpButtons = []
    }
    else {
      tmpButtons.push({text: workList[i-1].ordername, callback_data: ('addedOrder' + workList[i-1].id)})
    }
  }
  if(forLen % 2 == 1) {
    buttons.push([{text: workList[forLen-1].ordername, callback_data: ('addedOrder' + workList[forLen-1].id)}])
  }
  var options = {
    reply_markup: JSON.stringify({
      inline_keyboard: buttons,
      resize_keyboard:true
    })
  };
  return [textToSend, options]
}

async function showWorkInfo(action, lenCode) {
    var locale = wordByCode[lenCode];
    var workId = Number(action.substring(9, action.length))
    const fullWorkInfo = await db.getWorkInfo(workId)
    var textToSend = '';
    textToSend += '<b>' + locale['WorkName'] + '</b>: ' + fullWorkInfo[0][0].workname + '\n'
    textToSend += '<b>' + locale['WorkFirstCategory'] + '</b>: ' + fullWorkInfo[0][0].wtnf + '\n'
    textToSend += '<b>' + locale['WorkSecondCategory'] + '</b>: ' + fullWorkInfo[0][0].wtns + '\n'
    var tmpPrice = ''
    if(fullWorkInfo[0][0].isfree) {tmpPrice = locale['WorkIsFree']} else {tmpPrice = String(fullWorkInfo[0][0].price)}
    textToSend += '<b>' + locale['WorkPrice'] + '</b>: ' + tmpPrice + '\n'
    textToSend += '<b>' + locale['WorkAddDate'] + '</b>: ' + fullWorkInfo[0][0].adddate + '\n'
    textToSend += '<b>' + locale['WorkTags'] + '</b>: ' + '\n'
    for(let i = 0; i < fullWorkInfo[1].length; i++) {
      textToSend += '#' + fullWorkInfo[1][i].tagname + ' '
    }
    textToSend += '\n'
    textToSend += '<b>' + locale['WorkDescribtion'] + '</b>: ' + '\n'
    textToSend += fullWorkInfo[0][0].description
    var options = {
      reply_markup: JSON.stringify({
        keyboard: [
          [{ text: locale['EditWork'], web_app: {url: siteUrl + '/works/editwork/' + workId} }],
          [{ text: locale['DeleteWork']}],
          [{ text: locale['Back']}]
        ],
        resize_keyboard:true
      }),
      parse_mode: 'HTML',
    };
    return [textToSend, options]
}

async function showOrderInfo(msg, action, lenCode) {
  var locale = wordByCode[lenCode];
  var workId = Number(action.substring(10, action.length))
  const fullWorkInfo = await db.getOrderInfo(workId)
  var textToSend = '';
  textToSend += '<b>' + locale['OrderName'] + '</b>: ' + fullWorkInfo[0][0].ordername + '\n'
  textToSend += '<b>' + locale['WorkFirstCategory'] + '</b>: ' + fullWorkInfo[0][0].wtnf + '\n'
  textToSend += '<b>' + locale['WorkSecondCategory'] + '</b>: ' + fullWorkInfo[0][0].wtns + '\n'
  textToSend += '<b>' + locale['WorkPrice'] + '</b>: ' + fullWorkInfo[0][0].price + '\n'
  textToSend += '<b>' + locale['WorkAddDate'] + '</b>: ' + fullWorkInfo[0][0].adddate + '\n'
  textToSend += '<b>' + locale['WorkTags'] + '</b>: ' + '\n'
  for(let i = 0; i < fullWorkInfo[1].length; i++) {
    textToSend += '#' + fullWorkInfo[1][i].tagname + ' '
  }
  textToSend += '\n'
  textToSend += '<b>' + locale['WorkDescribtion'] + '</b>: ' + '\n'
  textToSend += fullWorkInfo[0][0].description
  var options = {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: locale['DeleteOrder']}],
        [{ text: locale['Back']}]
      ],
      resize_keyboard:true
    }),
    parse_mode: 'HTML'
  };
  return [textToSend, options, fullWorkInfo[0][0].id]
}




module.exports = { addedWorkHendlers, showWorkInfo, 
   addedOrderHendlers, showOrderInfo };