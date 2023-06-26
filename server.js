'use strict';

// REQUIRE
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const Story = require('./model/Story.js');

// require in the mongoose library
const mongoose = require('mongoose');

// MIDLDLEWARE
app.use(cors());

// DON'T FORGET THIS
app.use(express.json());

// DEFINE PORT VALIDATE .ENV IS WORKING
const PORT = process.env.PORT || 3002;

app.get('/test', (request, response) => {
  response.send('test request received')
})

// LISTEN
app.listen(PORT, () => console.log(`listening on ${PORT}`));

mongoose.connect(process.env.DB_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Mongoose is connected');
});

app.get('/stories', getStory);

async function getStory(request, response, next){
  try {

    let allStories = await Story.find({});

    response.status(200).send(allStories);
  } catch (error) {
    next(error);
  }
}

app.post('/stories', addStory);

async function addStory(request, response, next) {
  console.log(request.body)
  try {
    let createdStory = await Story.create(request.body);

    response.status(200).send(createdStory);
  } catch (error) {
    next(error);
  }
}

app.delete('/stories/:storyID', deleteStory);

async function deleteStory (request, response, next) {
  console.log(request.params);
  try {
    let id = request.params.storyID;

    await Story.findByIdAndDelete(id);

    response.status(200).send('Story was delete from DB');
  } catch (error) {
    next(error)
  }
}