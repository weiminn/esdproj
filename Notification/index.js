const express = require('express');
var app = express();
const bodyparser = require('body-parser')
const Sequelize = require('sequelize')
const request = require('request')
const nodemailer = require('nodemailer')

var amqp = require('amqplib/callback_api')

const sequelize = new Sequelize('book', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
})

let transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
       user: 'ee.ass.deez@gmail.com',
       pass: 'E$d@DDy69'
    }
});

var mail = () => {

    transport.sendMail({
        from: 'ee.ass.deez@gmail.com',
        to: 'wei.minn.2018@sis.smu.edu.sg',
        // to : 'baratharamm@sis.smu.edu.sg',
        subject: 'ESD Notfication API Test',
        text: 'suck ma deek'
    }, (err, info) => {
        if(err) {console.log(err)}
        else {console.log("email sent")}
    })
}
// mail()

amqp.connect('amqp://localhost', (err, conn) => {
    conn.createChannel((err, channel) => {
        channel.assertExchange("node_amqp", 'direct', {durable: false}, 
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
                                        console.log(msg.content.toString())
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