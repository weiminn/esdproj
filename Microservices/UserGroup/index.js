const express = require('express');
var app = express();
const bodyparser = require('body-parser')
const Sequelize = require('sequelize')
const request = require('request')
const axios = require('axios')
const cjson = require('circular-json')
const cors = require('cors')
 
app.use(cors())

// parse application/x-www-form-urlencoded
app.use(bodyparser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyparser.json())

const sequelize = new Sequelize('UserGrpOuting', 'admin', 'asdf1234', {
    // host: process.env.dbHOST,//'localhost',
    host: "esd.cyp1plpg63lm.ap-southeast-1.rds.amazonaws.com",
    dialect: 'mysql'
})

// const host = 'host.docker.internal'
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

    // console.log(req.body)
    axios.post('http://'+host+':3002/grpouting', {
        "CreatedBy": req.body.CreatedBy
    })
    .then((response) => {
        // console.log(`statusCode: ${response.statusCode}`)
        console.log(response.data)
        UserGrpOuting.create(
            {
                "UserID": response.data.CreatedBy,
                "GrpOutingID": response.data.GrpOutingID
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
    console.log(req.body)
    UserGrpOuting.create(req.body).then(result => {
        res.json(result)
    })
})

app.get("/UserGrpOuting/grpouting/:id", (req, res) => {
    
    const gid = req.params.id

    UserGrpOuting.findAll({
        where: {
            GrpOutingID: gid
        }
    }).then((groupUsers) => {
        console.log(groupUsers)

        var users = [];

        usersProcessed = 0;

        groupUsers.forEach(user => {
            request('http://'+host+':3001/user/' + user.UserID, { json: true }, (err, response, u) => {
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
    })
})

app.get("/UserGrpOuting/user/:id", (req, res) => {
    
    const uid = req.params.id

    UserGrpOuting.findAll({
        where: {
            UserID: req.params.id
        }
    }).then((UserGrpOutings) => {

        // console.log(UserGrpOutings)

        var groups = [];

        groupsProcessed = 0;

        UserGrpOutings.forEach(group => {

            console.log(group.GrpOutingID)
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
        
    })
})

app.listen(3003, () =>  console.log('Express server is running at port no: 3003'));
