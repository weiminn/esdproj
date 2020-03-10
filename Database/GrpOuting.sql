DROP DATABASE IF EXISTS GrpOuting;
CREATE DATABASE GrpOuting;
Use GrpOuting;

create table GrpOuting (
GrpOutingID varchar(100) not null,
CreatedBy varchar(100) not null,
constraint GrpOuting primary key (GrpOutingID));

INSERT INTO GrpOuting VALUES("outing123", "Hardyanto");
INSERT INTO GrpOuting VALUES("outing456", "Ram");