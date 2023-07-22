const siteUrl = 'https://allworksbot.localhost:3000'
//const siteUrl = 'https://192.168.1.84:3000'

const existLenCode = ['ru', 'en']

const wordByCode = {
    'ru': {
        'Unknown':'Я не знаю этой команды',
        'StartMessage': 'Здравствуйте! Добро пожаловать на платформу по поиску готовых работ и исполнителей! Выберите действие',
        'Back': 'Назад',
        'Account': 'Аккаунт',
        'WathCatalog': 'Каталог работ',
        'WathCatalogOrders': 'Каталог заказов',
        'AddWork': 'Добавить работу',
        'AddOrder': 'Добавить заказ',
        'AddedWorksList': 'Добавленные работы',
        'AddedOrdersList': 'Добавленные заказы',
        'BoughtWorksList': 'Приобретенные работы',
        'WithdrawalOfFunds': 'Вывод средств',
        'EnterDescribtion': 'Ввети описание',
        'ChoiseActionWork': `Выберите действие. Ставьте галочку "Можно ли написать", чтобы заказчик смог написать с целью получения демо версии работы или уточнения подробностей. (Например, часть кода для демонстрации)`,
        'ChoiseAction': 'Выберите действие',
        'AddFile': 'Прикрепите файл',
        'OrderHaveAdded': 'Заказ был добавлен',
        'ChoiseAddedWork': 'Выберите работу для совершения действий',
        'ChoiseAddedOrder': 'Выберите заказ для совершения действий',
        'ChoiseBoughtWork': 'Выберите приобретенную работу',
        'DeleteWork' : 'Удалить работу',
        'DeleteOrder' : 'Удалить заказ',
        'EditWork': 'Редактировать работу',
        'EditHaveDone': 'Изменения сохранены',
        'DeleteHaveDone': 'Удаление проведено успешно',
        'WorkName': 'Название работы',
        'OrderName': 'Название заказа',
        'WorkPrice': 'Цена',
        'WorkFirstCategory': 'Каттегория',
        'WorkSecondCategory': 'Подкаттегория',
        'WorkDescribtion': 'Описание',
        'WorkAddDate': 'Дата добавления',
        'WorkTags': 'Теги',
        'WorkIsFree': 'Бесплатно',
        'Yes': 'Да',
        'No': 'Нет',
        'SetCardNumber': 'Назначить номер карты',
        'EnterCardNumber': 'Введите номер карты',
        'CardAddedSuccess': 'Номер карты добавлен успешно',
        'CardAddedFatal': 'Ошибка при добавлении номера карты, попробуйте еще раз',
        'YourId': 'id',
        'YourName': 'Имя',
        'YourBalance': 'Баланс',
        'YourRating': 'Рейтинг',
        'YourRegDate': 'Дата регистрации',
        'YourCardNumber': 'Номер карты',
        'CountOfAddedWorks': 'Количество добавленных работ',
        'CountOfBoughtWorks': 'Количество приобретенных работ',
        'BoughtWorks': 'Приобретенные работы',
        'CantBuySelfWors': 'Нельзя приобрести свои или уже приобретенные работы',
        'SetFeedback': 'Оставить оценку',
        'SetFeedbackDone': 'Оценка поставлена',
        'SetFeedbackRaiting': 'Введите число от 1 до 5',
        'StopSpam': 'Пожалуйста, прекратите слишком часто отправлять сообщения, бот все равно защищен от этого',
        'WorkHaveAdd': 'Работа была добавлена, если к ней прилагаеться изображение (не больше 2мб), то отправьте в бот фотограцию, если нет, то нажмите назад',
        'Save': 'Сохраненно',
        'PhotoError': 'Фотография не соответсвует требованиям, попробуте еще раз или нажмите кнопку назад',
        'OrderHaveAdd': 'Заказ был добавлен'
    }
}
module.exports = { wordByCode:wordByCode, existLenCode:existLenCode, siteUrl:siteUrl };