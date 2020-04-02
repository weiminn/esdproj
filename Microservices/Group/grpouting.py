from flask import Flask, request, jsonify

from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
# from os import environ

from datetime import datetime

app = Flask(__name__) #Import Flask and initialize a Flask application.

# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root@localhost:3306/grpouting'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://admin:asdf1234@esdb.cyp1plpg63lm.ap-southeast-1.rds.amazonaws.com:3306/GrpOuting'
# app.config['SQLALCHEMY_DATABASE_URI'] = environ.get('dbURL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)
# CORS(app, resources={r"/*": {"origins": "*"}})

class Group(db.Model):
	__tablename__ = 'GrpOuting' #declare database and variables mirroring actual one

	grpOutingID = db.Column(db.Integer(), primary_key=True)
	createdBy = db.Column(db.String(100), nullable=False)
	description = db.Column(db.String(100), nullable=True)
	grpDateTime = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)

	def json(self):
		return {
			"GrpOutingID": self.grpOutingID, 
			"CreatedBy": self.createdBy,
			"Description": self.description,
			"GroupDateTime": self.grpDateTime
		}


# @app.route("/grpouting") #Use Flask's app.route decorator to map the URL route /groups to the function get_all. 
# def get_all():
# 	return jsonify({"grpouting": [grpouting.json() for grpouting in Group.query.all()]}) 

@app.route("/grpouting/<string:grpOutingID>") #Use Flask's app.route decorator to map the URL route /groups/grpOutingID to the function find_by_isbn13. 
#grpOutingID is a path variable of string type. 
def find_by_grpOutingID(grpOutingID):

	group = Group.query.filter_by(grpOutingID=grpOutingID).first()

	if group:
		return jsonify(group.json())
	return jsonify({"message": "Group Outing not found."}), 404


@app.route("/grpouting", methods=['POST'])#/<string:grpOutingID>
# @cross_origin()
def create_group():#grpOutingID
	# if (Group.query.filter_by(grpOutingID=grpOutingID).first()):
	# 	return jsonify({"message": "Group Outing ID: '{}' already exists.".format(grpOutingID)}), 400

	data = request.get_json()
	print("Data received")
	print(data)
	group = Group(
		createdBy=data['CreatedBy'], 
		description=data['Description']
	)

	try:
		db.session.add(group)
		db.session.commit()
	except Exception as error:
		# return jsonify({"message": "An error occurred creating the group outing."}), 500
		return print(str(error.args))

	return jsonify(group.json()), 201

if __name__ == '__main__': #start application as a flask app
	app.run(host='0.0.0.0', port=3002, debug=True) #port = 5000: allow u to set a diff port for diff services
	#debug =TRUE = print out error