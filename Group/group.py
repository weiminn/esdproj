from flask import Flask, request, jsonify

from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__) #Import Flask and initialize a Flask application.


app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root@localhost:3306/grpouting'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)

class Group(db.Model):
	__tablename__ = 'grpouting' #declare database and variables mirroring actual one

	grpOutingID = db.Column(db.Integer(), primary_key=True)
	createdBy = db.Column(db.String(100), nullable=False)

	def json(self):
		return {"GrpOutingID": self.grpOutingID, "CreatedBy ": self.createdBy}


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
def create_group():#grpOutingID
	# if (Group.query.filter_by(grpOutingID=grpOutingID).first()):
	# 	return jsonify({"message": "Group Outing ID: '{}' already exists.".format(grpOutingID)}), 400

	data = request.get_json()
	print("Data received")
	print(data)
	group = Group(createdBy=data['CreatedBy'])

	try:
		db.session.add(group)
		db.session.commit()
	except Exception as error:
		# return jsonify({"message": "An error occurred creating the group outing."}), 500
		return print(str(error.args))

	return jsonify(group.json()), 201

if __name__ == '__main__': #start application as a flask app
	app.run(port=3002, debug=True) #port = 5000: allow u to set a diff port for diff services
	#debug =TRUE = print out error