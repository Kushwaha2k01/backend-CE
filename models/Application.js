const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  experiences: {
    type: String,
    required: true,
  },
  jobType: {
    type: String,
    required: true,
  },
  jobLocation: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  resume: {
    type: String, // Store file path or URL
  },
  portfolio: {
    type: String,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Application', applicationSchema);
