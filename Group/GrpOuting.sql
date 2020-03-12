DROP DATABASE IF EXISTS GrpOuting;
CREATE DATABASE GrpOuting;
Use GrpOuting;

create table GrpOuting (
	GrpOutingID INT NOT NULL AUTO_INCREMENT,
	CreatedBy varchar(100) NOT NULL,
	constraint GrpOuting primary key (GrpOutingID)
);

INSERT INTO GrpOuting (CreatedBy) VALUES("123abc");
INSERT INTO GrpOuting (CreatedBy) VALUES("456abc");