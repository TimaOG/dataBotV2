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
    dataToSend['executor'] = $('#executor').val()
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
            <div class='col-lg-4 col-12'>
                <div class='orderBlock'>
                    <h5>
                    ` + data.answer[i].workname + `
                    </h5>
                    <p style="height: 50%;">
                    ` + data.answer[i].description.substr(0, 100) + ` <span style="color: var(--firstColor); cursor: pointer;" onclick="openWork(` + data.answer[i].id + `)">Подробнее...</span>
                    </p>
                    <div>
                        <div style="float: left;">
                            <h6>
                                ` + data.answer[i].adddate + ` 
                            </h6>
                        </div>
                        <div style="float: right;">
                        <h6>` + getTruePrice(data.answer[i].price) + `</h6>
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
        if(!data.workInfo[0].usecontact) {
            $('#userLink').attr('href', 'https://t.me/' + data.workInfo[0].username)
            $('#userLink').css('display', 'block')
            $('#copyButton').css('display', 'none')
            $('#exOrCon').html('Исполнитель: ')
            $('#executorWork').html(data.workInfo[0].username)
        } else {
            $('#copyButton').css('display', 'inline')
            $('#exOrCon').html('Контакт связи: ')
            $('#executorWork').html(data.workInfo[0].contact)
            $('#userLink').css('display', 'none')
        }
        $('#workInfoPrice').html(getTruePrice(data.workInfo[0].price))
        if(data.workInfo[0].filepath != null) {
            $('#imgWorkBlock').html('<img src="upload/' + data.workInfo[0].filepath +'" class="imgWork">')
        }
        else {
            $('#imgWorkBlock').html('')
        }
        $('#workInfoTagPlace').empty()
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

function getTruePrice(price) {
    if (price == 0) {
        return 'Бесплатно'
    }
    else {
        return price + ' ₽'
    }
}

$('#copyButton').on('click', function () {
    var $temp = $("<input type='text' id='tmpInput'>");
    $("#mc").append($temp);
    $('#copyButton').removeClass('bi-clipboard')
    $('#copyButton').addClass('bi-check-lg')
    $('#tmpInput').val($('#executorWork').html())
    document.getElementById('tmpInput').select()
    document.execCommand("copy");
    setTimeout(showCopyB, 2000);
    $temp.remove();
})

function showCopyB() {
    $('#copyButton').removeClass('bi-check-lg')
    $('#copyButton').addClass('bi-clipboard')
}

$('#claim').on('click', function () {
    $('#claimModal').modal('show');
})

function changeClaim(chNum) {
    var ch = document.getElementsByClassName('cbClaim')
    for(let i = 0; i < ch.length; i++) {
        if(i != (chNum - 1)) {
            ch[i].checked = false
        }
    }
}

function sendClaim() {
    var ch = document.getElementsByClassName('cbClaim')
    var trueNum = -1;
    var workIdToClaim = $('#workInfoId').val()
    for(let i = 0; i < ch.length; i++) {
        if(ch[i].checked) {
            trueNum = i;
            break;
        }
    }
    if(trueNum != -1) {
        $.post("/works/claim/" + workIdToClaim + '/' + trueNum, {}, function (data) {});
    }
    $('#claimModal').modal('hide');
}



