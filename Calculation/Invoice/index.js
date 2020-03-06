const express = require('express');
var app = express();
const bodyparser = require('body-parser')
const Sequelize = require('sequelize')
const request = require('request')

const sequelize = new Sequelize('book', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
})

app.post("/calculate", (req, res) => {
    
    uid = req.body.userId
    gid = req.body.groupId
    
    request.post({
            url: 'http://dummy.restapiexample.com/api/v1/employees',
            body: ''
        }, (err, response, b) => {
        if (err) { return console.log(err); }
        
        

    });
})

app.listen(3000, () =>  console.log('Express server is running at port no: 3000'));
