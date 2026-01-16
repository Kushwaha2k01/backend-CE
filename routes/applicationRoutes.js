const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { check, validationResult } = require('express-validator');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
  }
};

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

// Submit application
router.post('/', upload.single('resume'), [
  check('fullName').trim().notEmpty().withMessage('Full name is required'),
  check('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  check('experiences').trim().notEmpty().withMessage('Please describe your experience'),
  check('jobType').trim().notEmpty().withMessage('Please select a job type'),
  check('jobLocation').trim().notEmpty().withMessage('Please select a job location'),
  check('location').trim().notEmpty().withMessage('Location is required'),
  check('language').trim().notEmpty().withMessage('Language is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // remove uploaded file if present
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
    }
    return res.status(422).json({ errors: errors.array() });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Resume file is required' });
  }

  const { fullName, email, experiences, jobType, jobLocation, location, language, portfolio } = req.body;

  try {
    const newApplication = new Application({
      fullName,
      email: email.toLowerCase(),
      experiences,
      jobType,
      jobLocation,
      location,
      language,
      resume: req.file ? req.file.path : null,
      portfolio,
    });

    await newApplication.save();
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all applications (admin only)
router.get('/', async (req, res) => {
  try {
    const applications = await Application.find();
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
