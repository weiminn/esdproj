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

// amqp.connect('amqp://localhost', (err, conn) => {
//     conn.createChannel((err, ch) => {
        
//         ch.assertExchange('node_amqp', 'direct', {durable: true},
//             (err, ok) => {
//                 ch.assertQueue("test_queue", {durable: true},
//                     (err, ok) => {
//                         ch.bindQueue(
//                             "test_queue",
//                             "node_amqp",
//                             "test_key",
//                             null, 
//                             (err, ok) => {
//                                 ch.publish(
//                                     "node_amqp", 
//                                     "test_key", 
//                                     new Buffer("Test buffered content")
//                                 )
//                             }
//                         )
                        
//                     }
//                 )                
//             }
//         )
//     });
// })

const UserInvoices = sequelize.define('user_invoice', 
    {
        // attributes
        userId: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        groupId: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true
        },
        transactionId: {
            type: Sequelize.STRING,
            allowNull: false,
        }
    }, 
    {
        tableName: 'user_group',
        timestamps: false
    }
);

const paypal = require('paypal-rest-sdk')

paypal.configure({
    'mode': 'sandbox',
    'client_id': 'AWEBdvLIMyHfEUhsGWilTMs20bbjz5tuJFfpQZSKVObPjoM5jzbI2ZkpLvtxsQ0frSR7yKcqR63_50x8',
    'client_secret': 'EIP2FCMDufRC--aXhD27RYl7mnFNkd6DAcvSYM56DQiL8yNIKfo2P_SYL2hDNdwguKIevsii2lu5w_Hi'
})

app.post("/settlement", (req, res) => {
    // Sett.create(req.body).then(result => {
    //     res.json(result)
    // })


    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "transactions": 
        [
            {
                "amount": {
                    "total": "1",
                    "currency": "SGD",
                    "details": {
                        "subtotal": "1",
                        "tax": "0",
                        "shipping": "0",
                        "handling_fee": "0",
                        "shipping_discount": "0",
                        "insurance": "0"
                    }		
                },
                "description": "This is the payment transaction description.",
                
                "item_list": {
                    "items": 
                    [
                        {
                            "name": "hat",
                            "description": "Brown color hat",
                            "quantity": "1",
                            "price": "1",
                            "tax": "0",
                            "sku": "1",
                            "currency": "SGD"
                        }
                    ]
                }
            }
        ],

        "redirect_urls": {
            "return_url": "https://localhost:3000/success",
            "cancel_url": "https://localhost:3000/cancel"
        }
    }
    
    paypal.payment.create(create_payment_json, (err, payment) => {
        if (err) {
            console.log("error!")
            console.error(err)
            res.send(err)
        } else {
            console.log(payment)
            res.send(payment)
        }
        
    })
    // res.send('test')

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
