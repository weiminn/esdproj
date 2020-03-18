const express = require('express');
var app = express();
const bodyparser = require('body-parser')
const Sequelize = require('sequelize')
const request = require('request')
const axios = require('axios')
const cjson = require('circular-json')

// parse application/x-www-form-urlencoded
app.use(bodyparser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyparser.json())

const sequelize = new Sequelize('UserGrpOuting', 'admin', 'asdf1234', {
    // host: process.env.dbHOST,//'localhost',
    host: "testing.cyp1plpg63lm.ap-southeast-1.rds.amazonaws.com",
    dialect: 'mysql'
})

console.log(process.env.dbHOST)

const UserGrpOuting = sequelize.define('UserGrpOuting', {
    
    // attributes
    USERID: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    GRPOUTINGID: {
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

    axios.post('http://localhost:3002/grpouting', {
        "CreatedBy": req.body.CreatedBy
    })
    .then((response) => {
        // console.log(`statusCode: ${response.statusCode}`)
        console.log(response.data)
        UserGrpOuting.create(
            {
                "USERID": "123abc",
                "GROUPOUTINGID": 4
            }
        )
        // res.send(response.data)
    })
    .catch((error) => {
        console.error(error)
    })


    // request('http://localhost:3002/grpouting', {
    //     data: {
    //         "createdBy": req.body.CreatedBy
    //     }
        
    //   },
    // (err, response, body) => {
    //     if (err) { 
    //         return res.send(err); 
    //     }
    //     // console.log(response)
    //     res.send(response)
    //     // UserGrpOuting.create(req.body).then(result => {
    //     //     res.json(result)
    //     // })
    // });
    
})

app.post("/UserGrpOuting/join", (req, res) => {
    UserGrpOuting.create(req.body).then(result => {
        res.json(result)
    })
})

app.get("/UserGrpOuting/grpouting/:id", (req, res) => {
    
    const gid = req.params.id

    UserGrpOuting.findAll({
        where: {
            GRPOUTINGID: gid
        }
    }).then((groupUsers) => {
        console.log(groupUsers)

        var users = [];

        usersProcessed = 0;

        groupUsers.forEach(user => {
            request('http://localhost:3001/user/' + user.USERID, { json: true }, (err, response, u) => {
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
            USERID: req.params.id
        }
    }).then((UserGrpOutings) => {

        // console.log(UserGrpOutings)

        var groups = [];

        groupsProcessed = 0;

        UserGrpOutings.forEach(group => {

            console.log(group.GRPOUTINGID)
            request('http://localhost:3002/grpouting/' + group.GRPOUTINGID, { json: true }, (err, response, g) => {
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
