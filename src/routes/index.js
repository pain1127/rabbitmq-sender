/* eslint-disable require-jsdoc */
const express = require('express');
const router = new express.Router();
const amqp = require('amqplib/callback_api');
const config = require('../config/common');
const path = require('path');
const { execSync, exec } = require('child_process');
const fs = require('fs');
const moment = require('moment');
const timeFormat = require('hh-mm-ss')
/* GET home page. */
router.post('/editTest', async (req, res, next) => {

  //body
  const body = req.body;

  const jobID = moment().format('YYYYMMDDHHmmss');
  const jobList = body.request.edit;
  const output = body.request.output;
  const concatFile = `/Users/skpark/work/video/output/${jobID}.txt`;
  let concatText = '';
  const muxList = [];
  //console.log(jobList);

  // 개별 Cut 진행
  for (let i = 0; i < jobList.length; i++) {
    const outputFileName = await cutJob(jobList[i], jobID, i);
    concatText += `file '${outputFileName}'\n`;
    // muxList.push(outputFileName);
  }
  fs.writeFileSync(concatFile, concatText, 'utf8');
  // 작업 output mux
  const result = await muxJob(concatFile, output);
  console.log(result);
  res.send(body);

});

// 컷 잡 진행
const cutJob = async (job, jobID, index) => {
  console.log('---- 작업시작 ' + jobID + ':' + index + ' ----');
  // const duration;
  const start = moment.duration(job.start).asSeconds();
  const end = moment.duration(job.end).asSeconds();

  const duration = moment.utc(moment.duration((end - start), "seconds").asMilliseconds()).format("HH:mm:ss")

  // console.log(duration);
  //console.log(end);

  const inputFileName = path.join(job.input.dir, job.input.fileName);
  const onputFileName = `/Users/skpark/work/video/output/output${jobID}_${index}.mp4`;

  return new Promise((resolve, reject) => {
    const cmd = `ffmpeg -y -ss ${job.start} -i ${inputFileName} -to ${duration} -c copy ${onputFileName}`

    exec(cmd, (err, stdout, stderr) => {

      if (err) {
        reject(new Error(err));
      } else {
        //console.log(stderr);
        resolve(onputFileName);
      }

    });
  });
}


// 컷 잡 진행
const muxJob = async (concatFile, output) => {
  console.log('---- MUX 작업시작 ----');
  const outputFile = path.join(output.dir, output.fileName);

  return new Promise((resolve, reject) => {
    const cmd = `ffmpeg -f concat -safe 0 -i ${concatFile} ${outputFile}`

    exec(cmd, (err, stdout, stderr) => {

      if (err) {
        reject(new Error(err));
      } else {
        console.log(stderr);
        
        resolve('ok');
      }

    });
  });
}

/* GET home page. */
router.get('/', async (req, res, next) => {
  // amqp://admin:admin@localhost admin:admin = rabbitmq 계정:암호
  amqp.connect('amqp://pain1127:psk2950@localhost', function (error0, connection) {

    if (error0) {
      console.log(error0);
    }

    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }

      // queue name
      const queue = 'editjob';

      /*
      * queue가 없으면 만들어줌
      * durable : true -> queue 데이터를  rabbitmq가 재시작해도 가지고 있음(소비하기전까지)
      */
      channel.assertQueue(queue, {
        durable: true,
      });
      setInterval(sendToQueue, 1000, channel, queue);
    });

    setTimeout(function () {
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

/* GET home page. */
router.post('/edit', async (req, res, next) => {

  //body
  const body = req.body;

  // rabbitmq connect
  let connection = await amqp.connect(config.rabbitmq.url);

  // create exchange
  await channel.assertExchange('processing', 'direct', { durable: true })

  // create queues
  await channel.assertQueue('processing.requests', { durable: true })



  res.send(body);

});

module.exports = router;
