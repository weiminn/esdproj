from flask import Flask, request, jsonify

from flask_sqlalchemy import SQLAlchemy  
from flask_cors import CORS
# from os import environ

app = Flask(__name__) #Import Flask and initialize a Flask application.


app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://admin:asdf1234@esdb.cyp1plpg63lm.ap-southeast-1.rds.amazonaws.com:3306/User'
# app.config['SQLALCHEMY_DATABASE_URI'] = environ.get('dbURL')
# print(environ.get('dbURL'))
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)

class User(db.Model):
	__tablename__ = 'User' #declare database and variables mirroring actual one

	userID = db.Column(db.String(100), primary_key=True)
	userName = db.Column(db.String(100), nullable=False)
	email = db.Column(db.String(100), nullable=False)
	pwd = db.Column(db.String(100), nullable=False)

	def __init__(self, userID, userName, email, pwd):
		self.userID = userID
		self.userName = userName
		self.email = email
		self.pwd = pwd

	def json(self):
		return {"UserID": self.userID, "Username": self.userName, "Email": self.email, "Pwd": self.pwd}


@app.route("/user") #Use Flask's app.route decorator to .map the URL route /users to the function get_all. 
def get_all():
	#return 'user api endpoint'
	return jsonify({"users": [users.json() for users in User.query.all()]})

@app.route("/user/<string:userID>") #Use Flask's app.route decorator to map the URL route /users/userID to the function find_by_isbn13. 
#userID is a path variable of string type. 
def find_by_userID(userID):

	user = User.query.filter_by(userID=userID).first()

	if user:
		return jsonify(user.json())
	return jsonify({"message": "User not found."}), 404


@app.route("/user/<string:userID>", methods=['POST'])
def create_user(userID):
	if (User.query.filter_by(userID=userID).first()):
		return jsonify({"message": "User ID: '{}' already exists.".format(userID)}), 400

	data = request.get_json()
	user = User(userID, **data)

	try:
		db.session.add(user)
		db.session.commit()
	except:
		return jsonify({"message": "An error occurred creating the user."}), 500

	return jsonify(user.json()), 201

#print (__name__)
if __name__ == '__main__': #start application as a flask app
	app.run(host='0.0.0.0', port=3001, debug=True) #port = 5000: allow u to set a diff port for diff services
	#debug =TRUE = print out error