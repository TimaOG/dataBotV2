var slider = document.getElementById("myRange");
var output = document.getElementById("priceTo");
output.value = slider.value;
var dataToSend = {}
var workHasGet = 20

let tg = window.Telegram.WebApp;
tg.expand()

slider.oninput = function () {
    output.value = this.value;
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
    findOrders()
})
$('#loadMore').on('click', function () {
    var isShowAgain = true
    var currentPageNum = Number($('#pageNumber').val())
    currentPageNum += 1
    $('#pageNumber').val(currentPageNum)
    workHasGet += 20
    if(workHasGet >= workAllCount) {
        $('#loadMore').hide()
        isShowAgain = false
    }
    findOrders(currentPageNum, isShowAgain)
})

function findOrders(pageNumber = 1, isShowAgain=true) {
    $('#loadMore').hide()
    $('#loadSpin').css('visibility', 'visible')
    if (pageNumber == 1) {
        $('#resultBlock').empty()
    }
    dataToSend = {}
    dataToSend['workName'] = $('#workName').val()
    dataToSend['firstCategory'] = Number($('#firstCategory').val())
    dataToSend['secondCategory'] = Number($('#secondCategory').val())
    dataToSend['priceTo'] = Number($('#priceTo').val())
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
    $.post("/orders/getOrders/" + pageNumber, dataToSend, function (data) {
        for (let i = 0; i < data.answer.length; i++) {
            $('#resultBlock').append(`
            <div class='col-lg-6 col-12 orderBlock'>
                <h5>
                    ` + data.answer[i].ordername + `
                </h5>
                <p>
                    ` + data.answer[i].description.substr(0, 100) + `. <span style="color: var(--firstColor)" onclick="openOrder(` + data.answer[i].id + `)">Подробнее...</span>
                </p>
                <div>
                    <div style="float: left;">
                        <h6>
                            До ` + data.answer[i].adddate + `
                        </h6>
                    </div>
                        <div style="float: right;">
                            <h6>
                                ` + data.answer[i].price + `₽
                            </h6>
                        </div>
                    </div>
            </div>
        `)
        }
    });
    if(isShowAgain) {
        $('#loadMore').show()
    }
    $('#loadSpin').css('visibility', 'hidden')
}

function openOrder(orderId) {
    $('#mc').hide()
    $('#workModal').modal('show');
    $('#loadSpin2').css('visibility', 'visible')
    $.get("/orders/orderInfo/" + orderId, function (data) {
        $('#workInfoId').val(data.orderInfo[0].id)
        $('#workNameInfo').html(data.orderInfo[0].ordername)
        $('#workInfoDescription').html(data.orderInfo[0].description)
        $('#workInfoFistCategory').html(data.orderInfo[0].wtnf)
        $('#workInfoSecondCategory').html(data.orderInfo[0].wtns)
        $('#workInfoData').html(data.orderInfo[0].adddate)
        $('#workInfoPrice').html(data.orderInfo[0].price + ' ₽')
        $('#workInfoTagPlace').empty()
        $('#userLink').attr('href', 'https://t.me/' + data.orderInfo[0].username)
        for (let i = 0; i < data.orderTags.length; i++) {
            $('#workInfoTagPlace').append(`
            <div class="col-auto tagParentBlockModal">
                <p>#` + data.orderTags[i].tagname + `</p>
            </div>
            `)
        }
    })
    $('#loadSpin2').css('visibility', 'hidden')
    $('#mc').show()
}

