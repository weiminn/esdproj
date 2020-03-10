DROP DATABASE IF EXISTS Invoice;
CREATE DATABASE Invoice;
use Invoice;

create table Invoice
	( INVOICEID VARCHAR(50) not null,
	InvoiceDateTime DATETIME not null,
	DESCRIPTION VARCHAR(100) not null,
	TITLE VARCHAR(100) not null,
	AMOUNT DECIMAL(6,2) not null,
	CONSTRAINT INVOICE_PK PRIMARY KEY (INVOICEID));
    
INSERT INTO Invoice VALUES("Invoice123", "2017-06-15 09:34:21", "Movie", "Movie Outing", 200);
INSERT INTO Invoice VALUES("Invoice456", "2019-06-15 09:34:21", "Movie", "Movie Outing", 300);
    
CREATE TABLE UserInvoice
( UserID VARCHAR(100) NOT NULL,
  InvoiceID VARCHAR(100) NOT NULL,
  Creator TINYINT(1) NOT NULL,
  CONSTRAINT UserInvoice_PK PRIMARY KEY (USERID, INVOICEID));

INSERT INTO UserInvoice VALUES("HongRen", "Invoice123", 1);