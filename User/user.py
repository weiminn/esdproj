from flask import Flask, request, jsonify

from flask_sqlalchemy import SQLAlchemy  
from flask_cors import CORS

app = Flask(__name__) #Import Flask and initialize a Flask application.


app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root@localhost:3306/users'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)

class User(db.Model):
	__tablename__ = 'users' #declare database and variables mirroring actual one

	userID = db.Column(db.String(100), primary_key=True)
	userName = db.Column(db.String(100), nullable=False)
	pwd = db.Column(db.String(100), nullable=False)

	def __init__(self, userID, userName, pwd):
		self.userID = userID
		self.userName = userName
		self.pwd = pwd

	def json(self):
		return {"USERID": self.userID, "USERNAME": self.userName, "PWD": self.pwd}


@app.route("/users") #Use Flask's app.route decorator to map the URL route /users to the function get_all. 
def get_all():
	return jsonify({"users": [users.json() for users in User.query.all()]})

@app.route("/users/<string:userID>") #Use Flask's app.route decorator to map the URL route /users/userID to the function find_by_isbn13. 
#userID is a path variable of string type. 
def find_by_userID(userID):

	user = User.query.filter_by(userID=userID).first()

	if user:
		return jsonify(user.json())
	return jsonify({"message": "User not found."}), 404


@app.route("/users/<string:userID>", methods=['POST'])
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
	app.run(port=5000, debug=True) #port = 5000: allow u to set a diff port for diff services
	#debug =TRUE = print out error