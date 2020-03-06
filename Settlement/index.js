const express = require('express');
var app = express();
const bodyparser = require('body-parser')
const Sequelize = require('sequelize')
const request = require('request')
const nodemailer = require('nodemailer')
const amqp = require('amqplib/callback_api');

const sequelize = new Sequelize('book', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
})

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

const UserInvoices = sequelize.define('user_invoice', {
    // attributes
    userId: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
    invoiceId: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    owner: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    }
}, {
    tableName: 'user_group',
    timestamps: false
}
);

app.post("/invoice", (req, res) => {
    Invoice.create(req.body).then(result => {
        res.json(result)
    })
})

app.get("/invoice/:id", (req, res) => {

    const iid = req.params.id

    Invoice.findOne(iid).then((invoice) => {
        if(invoice)
            return res.send(invoice)
        else
            return res.send("Invoice not found!")
    })
})