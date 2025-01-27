// const express = require('express');
// var app = express();
// const bodyparser = require('body-parser')
// const Sequelize = require('sequelize')
const request = require('request')
const nodemailer = require('nodemailer')
const amqp = require('amqplib/callback_api')
// const cors = require('cors')
 
// app.use(cors())
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

//const host = 'host.docker.internal'
//const invoiceHost = '18.139.154.66'
//const userHost    = '13.228.102.119'
const host = 'localhost'

const mail = (toEmail, subject, cont) => {

    transport.sendMail({
        from: 'ee.ass.deez@gmail.com',
        to: toEmail,
        // to : 'baratharamm@sis.smu.edu.sg',
        subject: subject,
        text: cont
    }, (err, info) => {
        if(err) {console.log(err)}
        else {
            console.log("email sent")
            console.log(info)
        }
    })
}

amqp.connect('amqp://salczyxm:Zm_ITWhakVCC00r91B_3018rPKHuJRyM@crane.rmq.cloudamqp.com/salczyxm', (err, conn) => {
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

                                        //request.get('http://' + userHost + ':5100/user/' + msg.UserID, { json: true }, (err, uresponse) => {
                                        request.get('http://' + host + ':3001/user/' + msg.UserID, { json: true }, (err, uresponse) => {
                                            console.log(uresponse.body)
                                            const email = uresponse.body.Email

                                            //request.get('http://' + invoiceHost + ':5100/invoice/' + msg.InvoiceID, { json: true }, (err, iresponse) => {
                                            request.get('http://' + host + ':3004/invoice/' + msg.InvoiceID, { json: true }, (err, iresponse) => {
                                                console.log(iresponse.body)
                                                const username = uresponse.body.Username
                                                const invoiceName = iresponse.body.Title
                                                const invoiceTransaction = msg.TransactionID
                                                
                                                console.log("Sending email to " + email)
                                                mail(email, "Invoice Paid", "Dear " + username + 
                                                ", \n\nYou have paid for '" + invoiceName + "' via Transaction: " + invoiceTransaction)
                                                
                                                //request.get('http://' + invoiceHost + ':5100/invoice/' + iresponse.body.InvoiceID + '/owner' , { json: true }, (err, oresponse, ob) => {
                                                request.get('http://' + host + ':3004/invoice/' + iresponse.body.InvoiceID + '/owner' , { json: true }, (err, oresponse, ob) => {
                                                    console.log(ob)
                                                    const ownername = oresponse.body.Username
                                                    const oemail = oresponse.body.Email

                                                    console.log("Sending email to " + oemail)
                                                    mail(oemail, "Your Invoice Settled", 
                                                    "Dear " + ownername + 
                                                    ", \n\nYour invoice, '" + invoiceName + "', has been settled by " + username + " via Transaction: " + invoiceTransaction)

                                                })
                                                
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