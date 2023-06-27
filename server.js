'use strict';

// REQUIRE
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

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
app.post('/stories', generateStory);
app.delete('/stories/:storyID', deleteStory);

async function generateStory(request, response, next) {
  try {

    const aiResponse = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Tell me a bedtime story for a ${request.body.age} year old individual with the following parameters: topic: ${request.body.topic}, protagonist: ${request.body.mainChar} setting: ${request.body.setting}, conflict: ${request.body.conflict}.`,
      max_tokens: 200,
      temperature: 0.8,
    });

    let aiStory = aiResponse.data.choices[0].text

    let storyObject = {
      title: request.body.title,
      content: aiStory,
      date: Date.now(),
      entry: ''
    }
    console.log(storyObject);

    await Story.create(storyObject)

    response.status(200).send(aiStory);
  } catch (error) {
    next(error);
  }
}

app.post('*', (request, response) => {
  response.status(404).send('Not available');
});

app.use((error, request, response, next) => {
  console.log(error.message);
  response.status(500).send(error.message);
});

async function getStory(request, response, next) {
  try {

    let allStories = await Story.find({});

    response.status(200).send(allStories);
  } catch (error) {
    next(error);
  }
}

async function deleteStory(request, response, next) {
  console.log(request.params);
  try {
    let id = request.params.storyID;

    await Story.findByIdAndDelete(id);

    response.status(200).send('Story was delete from DB');
  } catch (error) {
    next(error)
  }
}