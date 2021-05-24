'use strict';

const dotenv = require('dotenv');
dotenv.config();

const config = {
  env: process.env.NODE_ENV,
  port: process.env.USE_PORT,
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
  },
};

module.exports = config;
