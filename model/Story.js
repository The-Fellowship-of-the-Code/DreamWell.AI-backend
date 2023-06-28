'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const storySchema = new Schema({
  title: { type: String},
  content: { type: String},
  date: {type: String},
  entry: {type: String}
  
});

const Story = mongoose.model('stories', storySchema);

module.exports = Story;