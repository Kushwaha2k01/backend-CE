const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { check, validationResult } = require('express-validator');

// Handle contact form submission
router.post('/', [
  check('fullName').trim().notEmpty().withMessage('Full name is required'),
  check('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  check('message').trim().notEmpty().withMessage('Message is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const { fullName, email, message } = req.body;

    // Create new contact entry (store email lowercase)
    const newContact = new Contact({
      fullName,
      email: email.toLowerCase(),
      message
    });

    // Save to database
    await newContact.save();

    console.log('Contact form submission saved:', { fullName, email });

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error saving contact form:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;