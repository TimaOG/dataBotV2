CREATE TABLE public.users (
	id serial4 NOT NULL,
	userfirstname varchar(255) NOT NULL,
	rating int2 NULL,
	registrationdate date NULL,
	username varchar NULL,
	CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE OR REPLACE FUNCTION public.before_insert_user()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
	begin
		new.rating = 0;
		new.registrationDate = NOW();
		return new;
	END;
$function$
;

create trigger bs_user before
insert
    on
    public.users for each row execute function before_insert_user();


CREATE TABLE public.worktypefirst (
	id int4 NOT NULL,
	worktypename varchar(255) NOT NULL,
	CONSTRAINT tasktypefirst_pkey PRIMARY KEY (id)
);

CREATE TABLE public.worktypesecond (
	id int4 NOT NULL,
	worktypename varchar(255) NOT NULL,
	fkfirsttype int4 NOT NULL,
	CONSTRAINT tasktypesecond_pkey PRIMARY KEY (id),
	CONSTRAINT tasktypesecond_fkfirsttype_fkey FOREIGN KEY (fkfirsttype) REFERENCES public.worktypefirst(id)
);

CREATE TABLE public.works (
	id serial4 NOT NULL,
	workname varchar(255) NOT NULL,
	fkuserowner int4 NOT NULL,
	description text NOT NULL,
	price int4 NOT NULL,
	fkworktypefirst int2 NOT NULL,
	fkworktypesecond int2 NOT NULL,
	isfree bool NULL,
	adddate date NULL,
	raiting float4 NULL,
	raitingcount int4 NULL,
	CONSTRAINT works_pkey PRIMARY KEY (id),
	CONSTRAINT works_fkuserowner_fkey FOREIGN KEY (fkuserowner) REFERENCES public.users(id),
	CONSTRAINT works_tasktypefirst_fkey FOREIGN KEY (fkworktypefirst) REFERENCES public.worktypefirst(id),
	CONSTRAINT works_tasktypesecond_fkey FOREIGN KEY (fkworktypesecond) REFERENCES public.worktypesecond(id)
);

CREATE TABLE public.worktags (
	id serial4 NOT NULL,
	tagname varchar NULL,
	fkwork int4 NULL,
	CONSTRAINT worktags_pkey PRIMARY KEY (id),
	CONSTRAINT worktags_fkwork_fkey FOREIGN KEY (fkwork) REFERENCES public.works(id)
);

CREATE TABLE public.orders (
	id serial4 NOT NULL,
	ordername varchar(255) NOT NULL,
	fkuserowner int4 NOT NULL,
	description text NOT NULL,
	price int4 NOT NULL,
	fkworktypefirst int2 NOT NULL,
	fkworktypesecond int2 NOT NULL,
	adddate date NULL,
	CONSTRAINT orders_pkey PRIMARY KEY (id),
	CONSTRAINT orders_fkuserowner_fkey FOREIGN KEY (fkuserowner) REFERENCES public.users(id),
	CONSTRAINT orders_tasktypefirst_fkey FOREIGN KEY (fkworktypefirst) REFERENCES public.worktypefirst(id),
	CONSTRAINT orders_tasktypesecond_fkey FOREIGN KEY (fkworktypesecond) REFERENCES public.worktypesecond(id)
);

CREATE TABLE public.ordertags (
	id serial4 NOT NULL,
	tagname varchar NULL,
	fkwork int4 NULL,
	CONSTRAINT ordertags_pkey PRIMARY KEY (id),
	CONSTRAINT ordertags_fkwork_fkey FOREIGN KEY (fkwork) REFERENCES public.orders(id)
);


-- CREATE OR REPLACE PROCEDURE public.update_work_rating(IN workidp integer, IN workraiting integer, IN userid integer)
--  LANGUAGE plpgsql
-- AS $procedure$
-- declare
--    	tmpRaiting float;
--    	tmpCount int;
--    	isCan boolean;
-- 	begin
-- 		select issetfeedback into isCan from boughtworks where workid = workIdP and fkuserowner = userId;
-- 		if isCan = false then
-- 		begin
-- 			select raiting into tmpRaiting from works where id = workIdP;
-- 			select raitingcount into tmpCount from works where id = workIdP;
-- 			tmpRaiting = tmpRaiting * tmpCount;
-- 			update works set raiting = ((tmpRaiting + workRaiting) / 
-- 			((select raitingcount from works where id = workIdP)+1)), raitingcount = ((select raitingcount from works where id = workIdP)+1) where id = workIdP;
-- 		end;
-- 		end if;
-- 		update boughtworks set issetfeedback = true where workid = workIdP and fkuserowner = userId;
-- 	END;
-- $procedure$
-- ;

INSERT INTO public.worktypefirst (id, worktypename) VALUES(1, 'Дизайн');
INSERT INTO public.worktypefirst (id, worktypename) VALUES(2, 'IT и разработка');
INSERT INTO public.worktypefirst (id, worktypename) VALUES(3, 'SEO и трафик');
INSERT INTO public.worktypefirst (id, worktypename) VALUES(4, 'Текста и переводы');
INSERT INTO public.worktypefirst (id, worktypename) VALUES(5, 'Бизнес');
INSERT INTO public.worktypefirst (id, worktypename) VALUES(6, 'Учеба и образовательные учереждения');
INSERT INTO public.worktypefirst (id, worktypename) VALUES(7, 'Соцсети и реклама');
INSERT INTO public.worktypefirst (id, worktypename) VALUES(8, 'Услуги');
INSERT INTO public.worktypefirst (id, worktypename) VALUES(9, 'Аудио и видео');

INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(1, 'Логотипы', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(2, 'Визитки', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(3, 'Брендирование', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(4, 'Презентации', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(5, 'Инфографика', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(6, 'Карты и схемы', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(7, 'Рисунки', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(8, 'Тату', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(9, 'Стикеры', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(10, 'Веб-дизайн', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(11, 'Иконки', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(12, 'Баннеры', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(13, 'Дизайн соцсетей', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(14, 'Дизайн для маркетплейсов', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(15, 'Интерьер', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(16, 'Экстерьер', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(17, 'Дизайн мебели', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(18, 'Промышленный дизайн', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(19, 'Фотомонтаж', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(20, 'Брошюры, афиши, листовки', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(21, 'Книги, грамоты', 1);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(22, 'Front-end разработка', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(23, 'Back-end разработка', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(24, 'Full-stack разработка', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(25, 'Доработка сайта', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(26, 'Настройка сайта', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(27, 'Защита сайта', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(28, 'Копия сайта', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(29, 'Верстка по макету', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(30, 'Макросы для Office', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(31, '1С', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(32, 'SAP', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(33, 'Готовые программы', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(34, 'Софт под ключ', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(35, 'Скрипты', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(36, 'Парсеры', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(37, 'Боты', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(38, 'IOS', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(39, 'Android', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(40, 'Разработка игр', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(41, 'Администрирование', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(42, 'Тестирование', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(43, 'Компьютерная помощь', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(56, 'Нейросети', 2);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(44, 'SEO оптимизация ', 3);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(45, 'Продвижение сайта', 3);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(46, 'Статьи', 4);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(47, 'SEO-текста', 4);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(48, 'Картички товаров', 4);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(49, 'Художественные текста', 4);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(50, 'Сценарии', 4);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(51, 'Переводы', 4);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(52, 'Набор текста с аудио, видео', 4);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(53, 'Составление резюме', 4);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(54, 'Продающие текста', 4);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(55, 'Остальное', 4);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(57, 'Работа в MS Office', 5);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(58, 'Поиск, анализ информации', 5);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(59, 'Рутинная работа', 5);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(60, 'Интелектуальная работа', 5);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(61, 'Налоги', 5);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(62, 'Помощь с ИП', 5);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(63, 'Помощь с ООО', 5);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(64, 'Консультации', 5);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(65, 'Продажа бизнеса', 5);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(66, 'Остальное', 5);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(67, 'Домашнее задание', 6);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(68, 'Курсовые работы', 6);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(69, 'Помощь с учебой', 6);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(70, 'Объяснение темы', 6);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(71, 'Рефераты', 6);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(72, 'Доклады', 6);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(73, 'Контрольные работы', 6);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(74, 'Остальное', 6);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(75, 'YouTube', 7);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(76, 'Instagram', 7);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(77, 'ВК', 7);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(78, 'Telegram', 7);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(79, 'Дзен', 7);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(80, 'Twitter', 7);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(81, 'TikTok', 7);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(82, 'Сбор данных о клиентах', 7);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(83, 'Готовые базы клиентов', 7);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(84, 'Google Ads', 7);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(85, 'Яндекс Директ', 7);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(86, 'Остальное', 7);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(87, 'Ремонт', 8);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(88, 'Строительство', 8);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(89, 'Красота', 8);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(90, 'Здоровье', 8);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(91, 'Работа', 8);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(92, 'Остальное', 8);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(93, 'Аудиоролик', 9);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(94, 'Озвучка и дикторы', 9);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(95, 'Написание музыки и песен', 9);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(96, 'Запись вокала', 9);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(97, 'Обработка звука', 9);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(98, 'Анимация', 9);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(99, 'Интро', 9);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(100, 'GIF', 9);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(101, '3D-анимация', 9);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(102, 'Видеосъемка', 9);
INSERT INTO public.worktypesecond (id, worktypename, fkfirsttype) VALUES(103, 'Монтаж', 9);


