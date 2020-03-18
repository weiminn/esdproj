const express = require('express');
var app = express();
const bodyparser = require('body-parser')
const Sequelize = require('sequelize')
const request = require('request')
const nodemailer = require('nodemailer')

var amqp = require('amqplib/callback_api')

// const sequelize = new Sequelize('book', 'root', '', {
//     host: 'localhost',
//     dialect: 'mysql'
// })

let transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
       user: 'ee.ass.deez@gmail.com',
       pass: 'E$d@DDy69'
    }
});

const mail = (toEmail, subject, cont) => {

    transport.sendMail({
        from: 'ee.ass.deez@gmail.com',
        to: toEmail,
        // to : 'baratharamm@sis.smu.edu.sg',
        subject: subject,
        text: cont
    }, (err, info) => {
        if(err) {console.log(err)}
        else {console.log("email sent")}
    })
}

amqp.connect('amqp://localhost', (err, conn) => {
    conn.createChannel((err, channel) => {
        channel.assertExchange("node_amqp", 'direct', {durable: true}, 
            (err, ok) => {
                channel.assertQueue("test_queue", {durable: true},
                    (err, aQ) => {
                        channel.bindQueue(
                            "test_queue",
                            "node_amqp",
                            "test_key",
                            null,
                            (err, reply) => {
                                channel.consume(
                                    "test_queue", 
                                    (msg) => {
                                        msg = JSON.parse(msg.content)

                                        request.get('http://localhost:3001/user/' + msg.UserID, { json: true }, (err, uresponse) => {
                                            console.log(uresponse.body)
                                            const email = "baratharamm.2018@smu.edu.sg"
                                            request.get('http://localhost:3004/invoice/' + msg.InvoiceID, { json: true }, (err, iresponse) => {
                                                console.log(iresponse.body)
                                                const username = uresponse.body.USERNAME
                                                const invoiceName = iresponse.body.TITLE
                                                const invoiceTransaction = msg.TransactionID
                                                
                                                mail(email, "Invoice Settled", "Dear " + username + ", \n\nThe invoice for " + invoiceName + " has been settled via Transaction: " + invoiceTransaction)
                                                
                                            })
                                        })
                                    },
                                    {
                                        noAck: true
                                    }
                                )
                            }
                        )
                    }
                )
            }
        )
    })
})