const express = require('express');
var app = express();
const bodyparser = require('body-parser')
const Sequelize = require('sequelize')
const request = require('request')
const nodemailer = require('nodemailer')
const amqp = require('amqplib/callback_api');

const sequelize = new Sequelize('Settlement', 'admin', 'asdf1234', {
    // host: process.env.dbHOST,//'localhost',
    host: "testing.cyp1plpg63lm.ap-southeast-1.rds.amazonaws.com",
    dialect: 'mysql'
})

// parse application/x-www-form-urlencoded
app.use(bodyparser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyparser.json())

const Settlement = sequelize.define('Settlement', 
    {
        // attributes
        UserID: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        InvoiceID: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        TransactionID: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        SettlementDateTime: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false,
        }
    }, 
    {
        tableName: 'Settlement',
        timestamps: false
    }
);

app.post("/settlement", (req, res) => {
    console.log(req.body)
    Settlement.create(req.body).then(result => {
        console.log(result)
        res.json(result)

        amqp.connect('amqp://salczyxm:Zm_ITWhakVCC00r91B_3018rPKHuJRyM@crane.rmq.cloudamqp.com/salczyxm', (err, conn) => {
            conn.createChannel((err, ch) => {
                
                ch.assertExchange('node_amqp', 'direct', {durable: true},
                    (err, ok) => {
                        ch.assertQueue("test_queue", {durable: true},
                            (err, ok) => {
                                ch.bindQueue(
                                    "test_queue",
                                    "node_amqp",
                                    "test_key",
                                    null, 
                                    (err, ok) => {

                                        const msg = {
                                            UserID: req.body.UserID,
                                            InvoiceID: req.body.InvoiceID,
                                            TransactionID: req.body.TransactionID
                                        }

                                        ch.publish(
                                            "node_amqp", 
                                            "test_key", 
                                            new Buffer(JSON.stringify(msg))
                                        )
                                    }
                                )
                            }
                        )                
                    }
                )
            });
        })
    })
})

app.get("/settlement/user/:uid/invoice/:iid", (req, res) => {

    const uid = req.params.uid
    const iid = req.params.iid

    Settlement.findAll({
        where: {
            UserID: uid,
            InvoiceId: iid
        }
    }).then((invoice) => {
        if(invoice)
            return res.send(invoice)
        else
            return res.send("Invoice not found!")
    })
})

app.listen(3005, () =>  console.log('Express server is running at port no: 3005'));
