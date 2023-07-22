const { wordByCode } = require('./translate.js');
const {siteUrl} = require('./translate.js'); 

function getKeyboard(boardName, localCode) {
    var locale = wordByCode[localCode];
    var options
    if (boardName == 'startBoard') {
        var options = {
            reply_markup: JSON.stringify({
                keyboard: [
                    [{ text: locale['Account'] }],
                    [{ text: locale['WathCatalog'], web_app: { url: siteUrl + '/works' } }, { text: locale['WathCatalogOrders'], web_app: { url: siteUrl + '/orders' } }],
                    [{ text: locale['AddWork'] }, { text: locale['AddOrder'] }],
                    [{ text: locale['AddedWorksList'] }, { text: locale['AddedOrdersList'] }],
                ],
                resize_keyboard: true,
            }),
            parse_mode:"HTML"
        };
    }
    else if (boardName == 'addWorkBoard') {
        var options = {
            reply_markup: JSON.stringify({
                keyboard: [
                    [{ text: locale['Back'] }],
                ],
                resize_keyboard: true,
            }),
            parse_mode:"HTML"
        };
    }
    return options
}

module.exports = { getKeyboard };