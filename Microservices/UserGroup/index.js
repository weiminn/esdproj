const express = require('express');
var app = express();
const bodyparser = require('body-parser')
const Sequelize = require('sequelize')
const request = require('request')
const axios = require('axios')
const cors = require('cors')
 
app.use(cors())

// parse application/x-www-form-urlencoded
app.use(bodyparser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyparser.json())

const sequelize = new Sequelize('UserGrpOuting', 'admin', 'asdf1234', {
    // host: process.env.dbHOST,//'localhost',
    host: "esdb.cyp1plpg63lm.ap-southeast-1.rds.amazonaws.com",
    dialect: 'mysql'
})

// const host = 'host.docker.internal'
const userHost        = '13.228.102.119'
const groupOutingHost = '18.136.144.202'
const host = 'localhost'

const UserGrpOuting = sequelize.define('UserGrpOuting', {
    
    // attributes
    UserID: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    GrpOutingID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    }, {
        tableName: 'UserGrpOuting',
        timestamps: false
    }
);


app.post("/UserGrpOuting/create", (req, res) => {

    console.log("request body:")
    console.log(req.body)
    //axios.post('http://'+groupOutingHost+':5100/grpouting', {
    axios.post('http://'+host+':3002/grpouting', {
        "CreatedBy": req.body.CreatedBy,
        "Description": req.body.Description
    })
    .then((response) => {
        // console.log(`statusCode: ${response.statusCode}`)
        console.log(response.data)
        UserGrpOuting.create(
            {
                "UserID": response.data.CreatedBy,
                "GrpOutingID": response.data.GrpOutingID,
            }
        ).then(result => {
            res.send(result)
        })
        
    })
    .catch((error) => {
        console.error(error)
    })    
})

app.post("/UserGrpOuting/join", (req, res) => {
    // console.log(req.body)
    //axios.get('http://'+groupOutingHost+':5100/grpouting/', 
    axios.get('http://'+host+':3002/grpouting/' + req.body.GrpOutingID)
    .then((response) => {
        console.log(response.data)
        if(response.data.GrpOutingID){
            console.log("Found group!")
            UserGrpOuting.create(req.body).then(result => {
                res.json(result)
            })
        } else {
            res.json({
                message: "No group exists with GrpOutingID: " + req.body.GrpOutingID
            })
        }
    })
    .catch((error) => {
        console.error(error)
    })  
})

app.get("/UserGrpOuting/grpouting/:id", (req, res) => {
    
    const gid = req.params.id

    UserGrpOuting.findAll({
        where: {
            GrpOutingID: gid
        }
    }).then((groupUsers) => {
        // console.log(groupUsers)

        var users = [];

        usersProcessed = 0;

        if(groupUsers.length != 0){

            groupUsers.forEach(user => {
                request('http://'+userHost+':5100/user/' + user.UserID, { json: true }, (err, response, u) => {
                // request('http://'+host+':3001/user/' + user.UserID, { json: true }, (err, response, u) => {
                    if (err) { 
                        return res.send(err); 
                    }
                    
                    users.push(u)
                    usersProcessed++

                    if(usersProcessed == groupUsers.length) {
                        return res.send(users)
                    }
                });
            })
        } else {
            return res.send("No users found for group id: " + gid)
        }   
    })
})

app.get("/UserGrpOuting/user/:id", (req, res) => {
    
    const uid = req.params.id

    UserGrpOuting.findAll({
        where: {
            UserID: req.params.id
        }
    }).then((UserGrpOutings) => {

        console.log(UserGrpOutings.length)

        var groups = [];

        groupsProcessed = 0;

        if(UserGrpOutings.length != 0){
            UserGrpOutings.forEach(group => {

                // console.log(group.GrpOutingID)
                //request('http://'+groupOutingHost+':5100/grpouting/' + group.GrpOutingID, { json: true }, (err, response, g) => {
                request('http://'+host+':3002/grpouting/' + group.GrpOutingID, { json: true }, (err, response, g) => {
                    if (err) { 
                        return res.send(err); 
                    }
    
                    groups.push(g)
                    groupsProcessed++
    
                    if(groupsProcessed == UserGrpOutings.length) {
                        return res.send(groups)
                    }
                });
            })
        } else {
            return res.send("No Groups found for user id: " + uid)
        }   
        
    })
})

app.listen(3003, () =>  console.log('Express server is running at port no: 3003'));
