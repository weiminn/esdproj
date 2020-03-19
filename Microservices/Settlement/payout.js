// use this file only for payouts to multiple users
var http = require("https");

var options = {
    "method": "POST",
    "hostname": "api.sandbox.paypal.com",
    "port": null,
    "path": "/v1/payments/payouts",
    "headers": {
        "accept": "application/json",
        "authorization": "Bearer A21AAHPuLFKsBNZm2-sQRkM5w1b_s6d-K_Fna9Hf3uL0EIkcJUz0W9WWlMQwjp4jdHnphekmjoiLvRNkqNuZFPsNVq2L51LWw",
        "content-type": "application/json"
    }
};



var req = http.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
        chunks.push(chunk);
    });

    res.on("end", function () {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
    });
});

req.write(JSON.stringify(
    {
        sender_batch_header: {
            email_subject: 'You have a payment',
            sender_batch_id: Math.floor(new Date() / 1000)
        }
        ,
        items:
            [
                {
                    recipient_type: 'EMAIL',
                    amount: { value: '100', currency: 'USD' },
                    receiver: 'user1.esd@gmail.com',
                    note: 'Payouts sample transaction',
                    sender_item_id: 'item-2-1584525551066'
                },
                // { 
                //     recipient_type: 'EMAIL',
                //     amount: { value: '100.00', currency: 'USD' },
                //     receiver: 'user2.esd@gmail.com',
                //     note: 'Payouts sample transaction',
                //     sender_item_id: 'item-3-1584525551066' 
                // } 
            ]
    }
));

req.end();