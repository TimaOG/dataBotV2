var slider = document.getElementById("myRange");
var output = document.getElementById("priceTo"); 
var dataToSend = {}

let tg = window.Telegram.WebApp;
//alert(tg.initDataUnsafe.user.first_name)
tg.MainButton.show()
tg.MainButton.text = "Добавить заказ"; //изменяем текст кнопки 
tg.MainButton.textColor = "#ffffff"; //изменяем цвет текста кнопки
tg.MainButton.color = "#E746E0";
tg.expand()


function addTag(){
    var tagValue = $('#tagValue').val(); 
    if(tagValue.replace(' ', '') !== '') {
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


$('#firstCategory').on('change', function(){
    var fc = $('#firstCategory').val()
    var toInsert = '<option value="0">Подкатегория</option>'
    for(let i = 0; i < workTypesSecond.length; i++){
        if(Number(workTypesSecond[i]['fkfirsttype']) == Number(fc)) {
            toInsert += '<option value="' + workTypesSecond[i]['id'] + '">' + workTypesSecond[i]['worktypename'] + '</option>'
        }
    }
    $('#secondCategory').empty(); $('#secondCategory').html(toInsert)
})

function validate() {
    $('#workName').css("border", "")
    $('#firstCategory').css("border", "")
    $('#secondCategory').css("border", "")
    $('#workPrice').css("border", "")
    $('#workDiscribtion').css("border", "")
    $('#tagValue').css("border", "")
    $('#workDateTo').css("border", "")
    var isCanSend = true
    if($('#workName').val() == "") {
        $('#workName').css("border", "1px solid red")
        isCanSend = false
    }
    if($('#firstCategory').val() == "0") {
        $('#firstCategory').css("border", "1px solid red")
        isCanSend = false
    }
    if($('#secondCategory').val() == "0") {
        $('#secondCategory').css("border", "1px solid red")
        isCanSend = false
    }
    if($('#workPrice').val() == "" || $('#workPrice').val() == "0") {
        $('#workPrice').css("border", "1px solid red")
        isCanSend = false
    }
    if($('#workDateTo').val() == "") {
        $('#workDateTo').css("border", "1px solid red")
        isCanSend = false
    }
    if($('#workDiscribtion').val() == "") {
        $('#workDiscribtion').css("border", "1px solid red")
        isCanSend = false
    }
    var tagList = document.getElementsByClassName('tagToPost');
    if(tagList.length == 0) {
        $('#tagValue').css("border", "1px solid red")
        isCanSend = false
    }
    return isCanSend
}

Telegram.WebApp.onEvent('mainButtonClicked', function(){
    if(!validate()) {
        return
    }
    var dataToSend = {}
    dataToSend.action = "addOrder"
    dataToSend.workName = $('#workName').val()
    dataToSend.firstCategory = $('#firstCategory').val()
    dataToSend.secondCategory = $('#secondCategory').val()
    dataToSend.workPrice = $('#workPrice').val()
    dataToSend.workDateTo = $('#workDateTo').val()
    var tagList = document.getElementsByClassName('tagToPost');
    var tagListToSend = []
    for(let i = 0; i < tagList.length; i++) {
        tagListToSend.push(tagList[i].innerHTML)
    }
    if(tagListToSend.length != 0){
        dataToSend.tags = tagListToSend
    }else {
        dataToSend.tags = 'null'
    }
    dataToSend.workDiscribtion = $('#workDiscribtion').val()
	tg.sendData(JSON.stringify(dataToSend)); 
});
