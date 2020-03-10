DROP DATABASE IF EXISTS UserGrpOuting;
CREATE DATABASE UserGrpOuting;
use UserGrpOuting

CREATE TABLE UserGrpOuting 
	(USERID VARCHAR(100) not null,
	 GrpOutingID VARCHAR(100) not null,
	CONSTRAINT USERGRPOUTING_PK PRIMARY KEY (USERID, GrpOutingID));


INSERT INTO UserGrpOuting VALUES("Hardyanto", "outing123");
INSERT INTO UserGrpOuting VALUES("HongRen", "outing123");
INSERT INTO UserGrpOuting VALUES("Ram", "outing123");
     

 



