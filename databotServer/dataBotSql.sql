CREATE TABLE public.users (
	id serial4 NOT NULL,
	userfirstname varchar(255) NOT NULL,
	rating int2 NULL,
	balance int4 NULL,
	registrationdate date NULL,
	cardnumber int4 NULL,
	username varchar NULL,
	CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE OR REPLACE FUNCTION public.before_insert_user()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
	begin
		new.rating = 0;
		new.balance = 0;
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
	fileid text NULL,
	isfree bool NULL,
	adddate date NULL,
	cansendmessage bool NULL,
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

CREATE TABLE public.boughtworks (
	id serial4 NOT NULL,
	workname varchar(255) NOT NULL,
	fkuserowner int4 NOT NULL,
	description text NOT NULL,
	price int4 NOT NULL,
	fkworktypefirst int2 NOT NULL,
	fkworktypesecond int2 NOT NULL,
	fileid text NULL,
	adddate date NULL,
	workid int4 NULL,
	issetfeedback bool NULL,
	CONSTRAINT boughtworks_pkey PRIMARY KEY (id),
	CONSTRAINT boughtworks_fkuserowner_fkey FOREIGN KEY (fkuserowner) REFERENCES public.users(id),
	CONSTRAINT boughtworks_tasktypefirst_fkey FOREIGN KEY (fkworktypefirst) REFERENCES public.worktypefirst(id),
	CONSTRAINT boughtworks_tasktypesecond_fkey FOREIGN KEY (fkworktypesecond) REFERENCES public.worktypesecond(id)
);

CREATE OR REPLACE PROCEDURE public.update_work_rating(IN workidp integer, IN workraiting integer, IN userid integer)
 LANGUAGE plpgsql
AS $procedure$
declare
   	tmpRaiting float;
   	tmpCount int;
   	isCan boolean;
	begin
		select issetfeedback into isCan from boughtworks where workid = workIdP and fkuserowner = userId;
		if isCan = false then
		begin
			select raiting into tmpRaiting from works where id = workIdP;
			select raitingcount into tmpCount from works where id = workIdP;
			tmpRaiting = tmpRaiting * tmpCount;
			update works set raiting = ((tmpRaiting + workRaiting) / 
			((select raitingcount from works where id = workIdP)+1)), raitingcount = ((select raitingcount from works where id = workIdP)+1) where id = workIdP;
		end;
		end if;
		update boughtworks set issetfeedback = true where workid = workIdP and fkuserowner = userId;
	END;
$procedure$
;

