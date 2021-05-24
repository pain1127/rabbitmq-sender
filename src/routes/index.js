/* eslint-disable require-jsdoc */
const express = require('express');
const router = new express.Router();
const amqp = require('amqplib/callback_api');
const config = require('../config/common');
/* GET home page. */
router.get('/', async (req, res, next) => {
  // amqp://admin:admin@localhost admin:admin = rabbitmq 계정:암호
  amqp.connect('amqp://pain1127:psk2950@localhost', function(error0, connection) {
    
    if (error0) {
      console.log(error0);
    }

    connection.createChannel(function(error1, channel) {
      if (error1) {
        throw error1;
      }

      // queue name
      const queue = 'test';

      /*
      * queue가 없으면 만들어줌
      * durable : true -> queue 데이터를  rabbitmq가 재시작해도 가지고 있음(소비하기전까지)
      */
      channel.assertQueue(queue, {
        durable: true,
      });
      setInterval(sendToQueue, 1000, channel, queue);
    });

    setTimeout(function() {
      connection.close();
      process.exit(0);
    }, 50000);
  });


  // const connect = await amqp.connect(config.rabbitmq.url);
  // const channel = await connect.createChannel();
  // res.send(channel);
});
function sendToQueue(channel, queue) {
  const msg = 'Hello World! transDate:' + new Date();
  channel.sendToQueue(queue, Buffer.from(msg));
  console.log(' [x] Sent %s', msg);
}
module.exports = router;
