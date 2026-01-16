const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const { check, validationResult } = require('express-validator');

// Subscribe to newsletter
router.post('/', [
  check('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let { email } = req.body;
  email = email.toLowerCase();

  try {
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }

    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();
    res.status(201).json({ message: 'Successfully subscribed to newsletter' });
  } catch (err) {
    if (err.code === 11000) { // duplicate key
      return res.status(400).json({ message: 'Email already subscribed' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all subscribers (admin only)
router.get('/', async (req, res) => {
  try {
    const subscribers = await Newsletter.find();
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
