var slider = document.getElementById("myRange");
var output = document.getElementById("priceTo");
output.value = slider.value;
var dataToSend = {}
var workHasGet = 20

let tg = window.Telegram.WebApp;
//alert(tg.initDataUnsafe.user.first_name)
//tg.MainButton.show()
tg.expand()

slider.oninput = function () {
    output.value = this.value;
    document.getElementById('isFree').checked = false
}

function addTag() {
    var tagValue = $('#tagValue').val();
    if (tagValue.replace(' ', '') !== '') {
        $('#tagPlace').append(`
        <div class="col-auto tagParentBlock" id="tag` + tagValue + `">
            <div class="row">
                <div class="col-auto">
                    <p class="tagToPost" >` + tagValue + `</p>
                </div>
                <div class="col-auto">
                    <p onClick="deleteTag('tag` + tagValue + `')">✕</p>
                </div>
            </div>
        </div>
        `)
    }
    $('#tagValue').val("")
}

function deleteTag(tagName) {
    $('#' + tagName).remove();
}

$('#isFree').on('change', function () {
    if (document.getElementById('isFree').checked) {
        $('#priceTo').val("0")
        $('#myRange').val("0")
    }
})

$('#firstCategory').on('change', function () {
    var fc = $('#firstCategory').val()
    var toInsert = '<option value="0">Подкатегория</option>'
    for (let i = 0; i < workTypesSecond.length; i++) {
        if (Number(workTypesSecond[i]['fkfirsttype']) == Number(fc)) {
            toInsert += '<option value="' + workTypesSecond[i]['id'] + '">' + workTypesSecond[i]['worktypename'] + '</option>'
        }
    }
    $('#secondCategory').empty(); $('#secondCategory').html(toInsert)
})

$('#findButton').on('click', function () {
    findWorks()
})
$('#loadMore').on('click', function () {
    var isShowAgain = true
    var currentPageNum = Number($('#pageNumber').val())
    currentPageNum += 1
    $('#pageNumber').val(currentPageNum)
    workHasGet += 20
    if (workHasGet >= workAllCount) {
        $('#loadMore').hide()
        isShowAgain = false
    }
    findWorks(currentPageNum, isShowAgain)
})

function findWorks(pageNumber = 1, isShowAgain = true) {
    $('#loadMore').hide()
    $('#loadSpin').css('visibility', 'visible')
    if (pageNumber == 1) {
        $('#resultBlock').empty()
    }
    //sleep(2000);
    dataToSend = {}
    dataToSend['workName'] = $('#workName').val()
    dataToSend['firstCategory'] = Number($('#firstCategory').val())
    dataToSend['secondCategory'] = Number($('#secondCategory').val())
    dataToSend['priceTo'] = Number($('#priceTo').val())
    dataToSend['isFree'] = document.getElementById('isFree').checked
    var tagList = document.getElementsByClassName('tagToPost');
    var tagListToSend = []
    for (let i = 0; i < tagList.length; i++) {
        tagListToSend.push(tagList[i].innerHTML)
    }
    if (tagListToSend.length != 0) {
        dataToSend['tags'] = tagListToSend
    } else {
        dataToSend['tags'] = 'null'
    }
    $.post("/works/getWorks/" + pageNumber, dataToSend, function (data) {
        for (let i = 0; i < data.answer.length; i++) {
            $('#resultBlock').append(`
            <div class='col-lg-6 col-12 workBlock '>
                <h5>` + data.answer[i].workname + ` (` + data.answer[i].adddate + `)</h5>
                <h6>` + getTruePrice(data.answer[i].price) + `</h6>
                <div class='row'>
                    <div class='col-6'>
                        <button onclick="openWork(` + data.answer[i].id + `)">Подробнее</button>
                    </div>
                    <div class='col-6'>
                        <button
                            onclick="addWorkFromList(` + data.answer[i].id + `, '` + data.answer[i].workname + `', ` + data.answer[i].price + `)">В корзину
                        </button>
                    </div>
                </div>
            </div>
        `)
        }
    });
    if (isShowAgain) {
        $('#loadMore').show()
    }
    $('#loadSpin').css('visibility', 'hidden')
}

function openWork(workId) {
    $('#mc').hide()
    $('#workModal').modal('show');
    $('#loadSpin2').css('visibility', 'visible')
    $.get("/works/workInfo/" + workId, function (data) {
        $('#workInfoId').val(data.workInfo[0].id)
        $('#workNameInfo').html(data.workInfo[0].workname)
        $('#workInfoDescription').html(data.workInfo[0].description)
        $('#workInfoFistCategory').html(data.workInfo[0].wtnf)
        $('#workInfoSecondCategory').html(data.workInfo[0].wtns)
        $('#workInfoData').html(data.workInfo[0].adddate)
        $('#workInfoPrice').html(getTruePrice(data.workInfo[0].price))
        if (data.workInfo[0].raiting != null) {
            $('#workRating').html('Рейтинг - ' + data.workInfo[0].raiting)
            //$('#raitingBlock').show()
        } else {
            $('#workRating').html('Нет оценок')
        }
        if (data.workInfo[0].raitingcount != null) {
            $('#workRatingAll').html('Всего оценок - ' + data.workInfo[0].raitingcount)
            //$('#raitingBlock').show()
        } else {
            $('#workRatingAll').html('')
        }
        $('#workInfoTagPlace').empty()
        $('#userLink').attr('href', 'https://t.me/' + data.workInfo[0].username)
        if (data.workInfo[0].cansendmessage) {
            $('#canWrite').show()
        } else {
            $('#canWrite').hide()
        }
        for (let i = 0; i < data.workTags.length; i++) {
            $('#workInfoTagPlace').append(`
            <div class="col-auto tagParentBlockModal">
                <p>#` + data.workTags[i].tagname + `</p>
            </div>
            `)
        }
    })
    $('#loadSpin2').css('visibility', 'hidden')
    $('#mc').show()
}

var basketCount = 0;
var workInBasket = []
var workInBasketInfo = {}
var notificationClose;
$('#addToBasket').on('click', function () {
    if (workInBasket.indexOf(Number($('#workInfoId').val())) == -1) {
        basketCount += 1
        $('#basketCount').html('Корзина ' + basketCount)
        workInBasket.push(Number($('#workInfoId').val()))
        workInBasketInfo[Number($('#workInfoId').val())] = { 'price': Number($('#workInfoPrice').html().split(' ')[0]), 'name': $('#workNameInfo').html() }
        $('#basketBody').append(`
        <div class="row" id="bw` + Number($('#workInfoId').val()) + `">
            <hr>
            <div class="col-6">
                <p>` + $('#workNameInfo').html() + `</p>
            </div>
            <div class="col-3">
                <p>` + getTruePrice(Number($('#workInfoPrice').html().split(' ')[0])) + `</p>
            </div>
            <div class="col-3" style="color: red;">
                <p onclick="deleteFromBasket(`+ Number($('#workInfoId').val()) + `)">Удалить</p>
            </div>
            <hr>
        </div>
        `)
        countTotalPriceForBasket()
        clearTimeout(notificationClose);
        var blockHidden = document.getElementById('notification');
        blockHidden.classList.add('b-show');
        notificationClose = setTimeout(hideNotification, 2000)
    }
})

function addWorkFromList(workId, workName, workPrice) {
    if (workInBasket.indexOf(workId) == -1) {
        basketCount += 1
        workInBasket.push(workId)
        workInBasketInfo[workId] = { 'price': workPrice, 'name': workName }
        $('#basketCount').html('Корзина ' + basketCount)
        $('#basketBody').append(`
        <div class="row" id="bw` + workId + `">
            <hr>
            <div class="col-6">
                <p>` + workName + `</p>
            </div>
            <div class="col-3">
                <p>` + getTruePrice(workPrice) + `</p>
            </div>
            <div class="col-3" style="color: red;">
                <p onclick="deleteFromBasket(`+ workId + `)">Удалить</p>
            </div>
            <hr>
        </div>
        `)
        countTotalPriceForBasket()
        clearTimeout(notificationClose);
        var blockHidden = document.getElementById('notification');
        blockHidden.classList.add('b-show');
        notificationClose = setTimeout(hideNotification, 2000)
    }
}

function deleteFromBasket(workId) {
    if (confirm("Вы уверены?")) {
        if (workInBasket.indexOf(workId) != -1) {
            basketCount -= 1
            $('#basketCount').html('Корзина ' + basketCount)
            workInBasket = removeItemOnce(workInBasket, workId);
            delete workInBasketInfo[workId]
            $("#bw" + workId).remove();
        }
    }
    countTotalPriceForBasket()
}

function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

$('#clearBasket').on('click', function () {
    if (confirm("Вы уверены?")) {
        basketCount = 0
        $('#basketCount').html('Корзина ' + basketCount)
        workInBasket = []
        workInBasketInfo = {}
        $("#basketBody").empty();

    }
    countTotalPriceForBasket()
})

function countTotalPriceForBasket() {
    let totalPrice = 0
    for (let i = 0; i < workInBasket.length; i++) {
        totalPrice += workInBasketInfo[workInBasket[i]]['price']
    }
    $('#totalPriceBasket').html('Итого: ' + totalPrice + ' ₽')
}
function hideNotification() {
    var blockHidden = document.getElementById('notification');
    blockHidden.classList.remove('b-show');
}

function basketGetWorks() {
    $("#paymentsBody").empty();
    tg.MainButton.show()
    tg.MainButton.text = "Приобрести"; //изменяем текст кнопки 
    tg.MainButton.textColor = "#ffffff"; //изменяем цвет текста кнопки
    tg.MainButton.color = "#E746E0";
    let totalPrice = 0
    for (let i = 0; i < workInBasket.length; i++) {
        totalPrice += workInBasketInfo[workInBasket[i]]['price']
        $('#paymentsBody').append(`
        <div class="row">
            <div class="col-8">
                <p>` + workInBasketInfo[workInBasket[i]]['name'] + `</p>
            </div>
            <div class="col-4">
                <p>` + getTruePrice(workInBasketInfo[workInBasket[i]]['price']) + `</p>
            </div>
        </div>
        `)
    }
    $('#totalPrice').html('Итого: ' + totalPrice + ' ₽')
    $('#basket').modal("hide")
    $('#workModal').modal("hide")
    $('#payments').modal("show")
}

function getTruePrice(price) {
    if (price == 0) {
        return 'Бесплатно'
    }
    else {
        return price + ' ₽'
    }
}

$('#payments').on('hidden.bs.modal', function (e) {
    tg.MainButton.hide()
})

Telegram.WebApp.onEvent('mainButtonClicked', function () {
    var dataToSend = {}
    dataToSend.action = "getWorks"
    dataToSend.works = workInBasket
    tg.sendData(JSON.stringify(dataToSend));
});
