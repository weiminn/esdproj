var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', (err, conn) => {
    conn.createChannel((err, ch) => {
        
        ch.assertExchange('nonode_amqpde_test', 'direct', {durable: true},
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

// var amqp = require('amqplib/callback_api')
// var amqpConn = null;

// const start = () => {
//     amqp.connect("localhost:5672", (err, conn) => {
//         if (err) {
//             console.error(err.message)
//             return
//         }

//         conn.on("error", (err) => {
//             if (err) console.error("Connection Closing with err: " + err.message)
//         })

//         conn.on("close", () => {
//             console.err("Console.closing")
//             return
//         })

//         console.log("AMQP connected")

//         amqp = conn
//         whenConnected()
//     })
// } 

// const whenConnected = () => {
//     startPublisher();
//     // startWorker();
// }

// var pubChannel = null;
// var offlinePubQueue = [];

// const startPublisher = () => {
//     amqpConn.createConfirmChannel(function(err, ch) {
//         if (closeOnErr(err)) return;

//         ch.on("error", function(err) {
//             console.error("[AMQP] channel error", err.message);
//         });

//         ch.on("close", function() {
//             console.log("[AMQP] channel closed");
//         });

//         pubChannel = ch;
//         while (true) {
//             var [exchange, routingKey, content] = offlinePubQueue.shift();
//             publish(exchange, routingKey, content);
//         }
//     });
// }

// const publish = (exchange, routingKey, content) => {
//     try {
//         pubChannel.publish(exchange, routingKey, content, { persistent: true },
//             function(err, ok) {
//                 if (err) {
//                     console.error("[AMQP] publish", err);
//                     offlinePubQueue.push([exchange, routingKey, content]);
//                     pubChannel.connection.close();
//                 }
//             });
//     } catch (e) {
//         console.error("[AMQP] publish", e.message);
//         offlinePubQueue.push([exchange, routingKey, content]);
//     }
// }

// function startWorker() {

//     amqpConn.createChannel(function(err, ch) {

//         if (closeOnErr(err)) return;

//         ch.on("error", function(err) {
//             console.error("[AMQP] channel error", err.message);
//         });

//         ch.on("close", function() {
//             console.log("[AMQP] channel closed");
//         });
    
//         ch.prefetch(10);
//         ch.assertQueue("jobs", { durable: true }, function(err, _ok) {
//             if (closeOnErr(err)) return;
//             ch.consume("jobs", processMsg, { noAck: false });
//             console.log("Worker is started");
//         });
//     });
// }

// function processMsg(msg){
//     work(msg, function(ok){
//         try {
//             if(ok)
//                 ch.ack(msg)
//             else
//                 ch.reject(msg,true)
//         } catch (e) {
//             closeOnErr(e)
//         }
//     })
// }

// function work(msg, cb){
//     console.log("PDF processing of ", msg.content.toString())
//     cb(true)
// }

// function closeOnErr(err){
//     if(!err) return false;
//     console.error(err)
//     amqp.close();
//     return true;
// }
  
// start();

// setInterval(() => {
//     publish("", "jobs", new Buffer("work work work"));
//     console.log("publishing")
// }, 1000);