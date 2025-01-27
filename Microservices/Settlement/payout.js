// use this file only for payouts to multiple users
var http = require("https");
const request = require('request')

module.exports.payout = (email, amount, transID) => { // ('user1.esd@gmail.com', 100, aT)
    request.post('https://api.sandbox.paypal.com/v1/oauth2/token', {
        headers: {
            "authorization": "Basic QVdFQmR2TElNeUhmRVVoc0dXaWxUTXMyMGJiano1dHVKRmZwUVpTS1ZPYlBqb001anpiSTJaa3BMdnR4c1EwZnJTUjd5S2NxUjYzXzUweDg6RUlQMkZDTUR1ZlJDLS1hWGhEMjdSWWw3bW5GTmtkNkRBY3ZTWU01NkRRaUw4eU5JS2ZvMlBfU1lMMmhETmR3Z3VLSWV2c2lpMmx1NXdfSGk=",
            "content-type": "application/x-www-form-urlencoded"
        },
        form: {
            'grant_type': 'client_credentials'
        }
    }, (e, r, b) => {
        if(e){
            console.log("Access token error:")
            console.error(e)
        }
        else {
            const aT = JSON.parse(b).access_token
            console.log(aT)
            console.log(email)
            console.log(amount)

            pO(email, amount, transID, aT)
    }})
}


const pO = (email, amount, transID, aT) => {
    request.post('https://api.sandbox.paypal.com/v1/payments/payouts', {
        headers: {
            "accept": "application/json",
            "authorization": "Bearer " + aT,
            "content-type": "application/json"
        },
        body: JSON.stringify({
            sender_batch_header: {
                email_subject: 'You have a payment',
                sender_batch_id: Math.floor(new Date() / 1000)
            }
            ,
            items:
                [
                    {
                        recipient_type: 'EMAIL',
                        amount: { value: amount, currency: 'SGD' },
                        receiver: email,
                        note: "Sender's transation: " + transID,
                        sender_item_id: transID
                    } 
                ]
        })
    }, (err, res, body) => {
        if(err) {
            console.log("Payout error:")
            console.error(err)
        }
        else
            console.log(body)
    })
}