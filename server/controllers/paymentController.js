const crypto = require('crypto');
const pool = require('../config/db');

const PRICING = {
  premium_listing: { amount: 499.99, label: 'Premium Job Listing' },
  featured_post: { amount: 199.99, label: 'Featured Post Boost' },
  subscription: { amount: 1499.99, label: 'Annual Hiring Subscription' },
};

exports.getPricing = (req, res) => {
  res.json(PRICING);
};

exports.processPayment = async (req, res) => {
  const { type, cardName, cardNumber, expiryDate, cvv } = req.body;

  if (!PRICING[type]) {
    return res.status(400).json({ message: 'Invalid payment type' });
  }
  if (!cardName || !cardNumber || !expiryDate || !cvv) {
    return res.status(400).json({ message: 'All card details are required' });
  }

  const cleanCard = cardNumber.replace(/\s/g, '');
  if (cleanCard.length < 13 || cleanCard.length > 19 || !/^\d+$/.test(cleanCard)) {
    return res.status(400).json({ message: 'Invalid card number' });
  }
  if (!/^\d{3,4}$/.test(cvv)) {
    return res.status(400).json({ message: 'Invalid CVV' });
  }

  try {
    const [company] = await pool.query('SELECT id, company_name FROM companies WHERE user_id = ?', [req.user.id]);
    if (company.length === 0) return res.status(404).json({ message: 'Company not found' });

    const reference = `TBA-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const { amount, label } = PRICING[type];
    const lastFour = cleanCard.slice(-4);

    await pool.query(
      'INSERT INTO transactions (company_id, amount, type, status, reference, description) VALUES (?, ?, ?, ?, ?, ?)',
      [company[0].id, amount, type, 'completed', reference, `${label} (Card ending ${lastFour})`]
    );

    res.json({
      message: 'Payment successful',
      reference,
      amount,
      label,
    });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ message: 'Payment processing failed' });
  }
};

exports.handleNotify = async (req, res) => {
  res.status(200).send('OK');
};
