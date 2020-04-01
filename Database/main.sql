DROP DATABASE IF EXISTS User;
CREATE DATABASE User;
use User;

CREATE TABLE User
(
	UserID VARCHAR(100) NOT NULL,
	Username VARCHAR(100) NOT NULL,
	Email VARCHAR(100) NOT NULL,
	Pwd VARCHAR(100) NOT NULL,
	CONSTRAINT USER_PK PRIMARY KEY (USERID)
);

INSERT INTO User
VALUES("HongHong", "HongRen", "user1.esd@gmail.com", "HongRen123");
INSERT INTO User
VALUES("Hardy", "Hardyanto", "user2.esd@gmail.com", "Hardy123");
INSERT INTO User
VALUES("Ramly", "Ram", "wei.minn.2018@sis.smu.edu.sg", "Ram123");
INSERT INTO User
VALUES("Marcie", "Amanda", "wei.minn.2018@sis.smu.edu.sg", "Amanda123");

DROP DATABASE IF EXISTS GrpOuting;
CREATE DATABASE GrpOuting;
Use GrpOuting;

create table GrpOuting
(
	GrpOutingID INT NOT NULL AUTO_INCREMENT,
	CreatedBy varchar (100) NOT NULL,
	GrpDateTime DATETIME NOT null,
	Description VARCHAR(100) null,
	constraint GrpOuting primary key (GrpOutingID)
);

	INSERT INTO GrpOuting
		(CreatedBy, GrpDateTime, Description)
	VALUES("HongHong", "2017-06-15 09:34:21", "Day out with Fwends");
	INSERT INTO GrpOuting
		(CreatedBy, GrpDateTime, Description)
	VALUES("Hardy", "2017-06-15 09:34:21", "Night out with Bros");

	DROP DATABASE IF EXISTS UserGrpOuting;
	CREATE DATABASE UserGrpOuting;
	use UserGrpOuting;

	CREATE TABLE UserGrpOuting
	(
		UserID VARCHAR(100) not null,
		GrpOutingID VARCHAR(100) not null,
		CONSTRAINT USERGRPOUTING_PK PRIMARY KEY (UserID, GrpOutingID)
	);


	INSERT INTO UserGrpOuting
	VALUES("HongHong", "1");
	INSERT INTO UserGrpOuting
	VALUES("Hardy", "1");
	INSERT INTO UserGrpOuting
	VALUES("HongHong", "2");

	DROP DATABASE IF EXISTS Invoice;
	CREATE DATABASE Invoice;
	use Invoice;

	create table Invoice
	(
		InvoiceID INT not null AUTO_INCREMENT,
		InvoiceDateTime DATETIME not null,
		Description VARCHAR (100) not null,
		Title VARCHAR (100) not null,
		Amount DECIMAL (6,2) not null,
		GrpOutingID INT not null,
		PhotoLink VARCHAR (100),
		CONSTRAINT INVOICE_PK PRIMARY KEY (InvoiceID)
	);

		INSERT INTO Invoice
			(InvoiceDateTime, Description, Title, Amount, GrpOutingID)
		VALUES("2017-06-15 09:34:21", "Plus theatre", "Movie Outing", 200, 1);
		-- INSERT INTO Invoice
		-- 	(InvoiceDateTime, Description, Title, Amount, GrpOutingID)
		-- VALUES("2019-06-15 09:34:21", "Seafood at Hotel", "Dinner Outing", 300, 1);

		CREATE TABLE UserInvoice
		(
			UserID VARCHAR(100) NOT NULL,
			InvoiceID INT NOT NULL,
			Owner TINYINT(1) NOT NULL,
			CONSTRAINT UserInvoice_PK PRIMARY KEY (UserID, InvoiceID)
		);

		INSERT INTO UserInvoice
		VALUES("HongHong", 1, 1);
		INSERT INTO UserInvoice
		VALUES("Hardy", 1, 0);

		-- INSERT INTO UserInvoice
		-- VALUES("Hardy", 2, 1);

		DROP DATABASE IF EXISTS Settlement;
		CREATE DATABASE Settlement;
		USE Settlement;

		CREATE TABLE Settlement
		(
			UserID VARCHAR(50) NOT NULL,
			InvoiceID VARCHAR(100) NOT NULL,
			TransactionID VARCHAR(100) NOT NULL,
			SettlementDateTime DATETIME NOT NULL,
			CONSTRAINT SETTLEMENT_PK PRIMARY KEY (UserID, InvoiceID)
		);

		INSERT INTO Settlement
		VALUES("HongHong", "1", "T123", "2017-06-16 09:34:21");