const express = require('express');
var app = express();
const bodyparser = require('body-parser')
const Sequelize = require('sequelize')
const request = require('request')

const sequelize = new Sequelize('usergrpouting', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
  })

  const UserGroup = sequelize.define('usergrpouting', {
      // attributes
      USERID: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true
          },
      GROUPID: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true
      },
      }, {
          tableName: 'usergrpouting',
          timestamps: false
      }
  );


app.post("/usergroup", (req, res) => {
    UserGroup.create(req.body).then(result => {
        res.json(result)
    })
})

app.get("/usergroup/group/:id", (req, res) => {
    
    const gid = req.params.id

    UserGroup.findAll({
        where: {
            GROUPID: gid
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

app.get("/usergroup/user/:id", (req, res) => {
    
    const uid = req.params.id

    UserGroup.findAll({
        where: {
            USERID: req.params.id
        }
    }).then((userGroups) => {

        console.log(userGroups)

        var groups = [];

        groupsProcessed = 0;

        userGroups.forEach(group => {
            request('http://localhost:3002/grpouting/' + group.GROUPID, { json: true }, (err, response, g) => {
                if (err) { 
                    return res.send(err); 
                }

                groups.push(g)
                groupsProcessed++

                if(groupsProcessed == userGroups.length) {
                    return res.send(groups)
                }
            });
        })
        
    })
})

app.listen(3003, () =>  console.log('Express server is running at port no: 3003'));
