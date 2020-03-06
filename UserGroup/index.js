const express = require('express');
var app = express();
const bodyparser = require('body-parser')
const Sequelize = require('sequelize')
const request = require('request')

const sequelize = new Sequelize('book', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
  })

  const UserGroup = sequelize.define('book', {
      // attributes
      userId: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true
          },
      groupId: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true
      },
      }, {
          tableName: 'user_group',
          timestamps: false
      }
  );

  const User = sequelize.define('book', {
      // attributes
      userId: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true
          },
      groupId: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true
      },
      }, {
          tableName: 'user',
          timestamps: false
      }
  );

  const Group = sequelize.define('book', {
      // attributes
      userId: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true
          },
      groupId: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true
      },
      }, {
          tableName: 'group',
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
        groupId: gid
    }).then((groupUsers) => {
        var users = [];

        usersProcessed = 0;

        groupUsers.forEach(user => {
            request('http://dummy.restapiexample.com/api/v1/employees', { json: true }, (err, response, u) => {
                if (err) { return console.log(err); }
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
        userId: req.params.id
    }).then((userGroups) => {
        var groups = [];

        groupsProcessed = 0;

        userGroups.forEach(user => {
            request('http://dummy.restapiexample.com/api/v1/employees', { json: true }, (err, response, g) => {
                if (err) { return console.log(err); }
                groups.push(g)
                groupsProcessed++

                if(groupsProcessed == userGroups.length) {
                    return res.send(groups)
                }
            });
        })
        
    })
})

app.listen(3000, () =>  console.log('Express server is running at port no: 3000'));
