const express = require('express');
var app = express();
const bodyparser = require('body-parser')
const Sequelize = require('sequelize')
const request = require('request')
const nodemailer = require('nodemailer')
const amqp = require('amqplib/callback_api');
const cors = require('cors')
const PO = require('./payout')
 
app.use(cors())

const sequelize = new Sequelize('Settlement', 'admin', 'asdf1234', {
    // host: process.env.dbHOST,//'localhost',
    host: "esd.cyp1plpg63lm.ap-southeast-1.rds.amazonaws.com",
    dialect: 'mysql'
})

// parse application/x-www-form-urlencoded
app.use(bodyparser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyparser.json())

// const host = 'host.docker.internal'
//const invoiceHost = '18.139.154.66'
const host = 'localhost'

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
        // console.log(result)
        res.json(result)

        //request.get('http://' + invoiceHost + ':5100/invoice/' + req.body.InvoiceID + '/owner' , { json: true }, (err, response, body) => {
        request.get('http://' + host + ':3004/invoice/' + req.body.InvoiceID + '/owner' , { json: true }, (err, response, body) => {
            console.log(response.body)
            PO.payout(response.body.Email, req.body.Amount, req.body.TransactionID)
        })

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

app.get("/settlement/invoice/:iid", (req, res) => {

    const iid = req.params.iid

    Settlement.findAll({
        where: {
            InvoiceId: iid
        }
    }).then((settlements) => {
        res.send(settlements)
    })
})

app.listen(3005, () =>  console.log('Express server is running at port no: 3005'));
