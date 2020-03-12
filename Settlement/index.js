const express = require('express');
var app = express();
const bodyparser = require('body-parser')
const Sequelize = require('sequelize')
const request = require('request')
const nodemailer = require('nodemailer')
const amqp = require('amqplib/callback_api');

const sequelize = new Sequelize('settlement', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
})

const Settlement = sequelize.define('settlement', 
    {
        // attributes
        UserID: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        Invoice: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        TransactionId: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        SettlementDateTime: {
            type: Sequelize.DATE,
            allowNull: false,
        }
    }, 
    {
        tableName: 'settlement',
        timestamps: false
    }
);

app.post("/settlement", (req, res) => {
    Sett.create(req.body).then(result => {
        res.json(result)

        amqp.connect('amqp://localhost', (err, conn) => {
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
                                        ch.publish(
                                            "node_amqp", 
                                            "test_key", 
                                            new Buffer("Test buffered content")
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

app.get("/settlement/:id", (req, res) => {

    const iid = req.params.id

    Invoice.findOne(iid).then((invoice) => {
        if(invoice)
            return res.send(invoice)
        else
            return res.send("Invoice not found!")
    })
})

app.listen(3000, () =>  console.log('Express server is running at port no: 3000'));
