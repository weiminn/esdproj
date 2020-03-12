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