'use strict';
const express = require('express');
const redisHelper = require('./redis')

// Constants
const PORT = 3000;
const HOST = 'api';

// App
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from /');
});

app.post('/count', async (req, res) => {
  try{
    let count = await redisHelper.lookup(req.body['room-id']);
    if(count){
      count++;
    } else {
      count = 1;
    }
    await redisHelper.store(req.body['room-id'], count)
    res.status(200).json({count: count})
  }catch(e){
    console.log(`Server Error: ${e}`)
  }
  
});

app.listen(PORT, 'api');
console.log(`Running on http://${HOST}:${PORT}`);