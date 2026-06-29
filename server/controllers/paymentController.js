const crypto = require('crypto');
const pool = require('../config/db');

const PRICING = {
  premium_listing: { amount: 499.99, label: 'Premium Job Listing' },
  featured_post: { amount: 199.99, label: 'Featured Post Boost' },
  subscription: { amount: 1499.99, label: 'Annual Hiring Subscription' },
};

function luhnCheck(cardNumber) {
  const digits = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(digits)) return false;

  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function validateExpiry(expiry) {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = parseInt('20' + match[2], 10);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const expiryDate = new Date(year, month);
  return expiryDate > now;
}

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
  if (!cardName.trim() || cardName.trim().length < 2) {
    return res.status(400).json({ message: 'Enter a valid cardholder name' });
  }

  const cleanCard = cardNumber.replace(/\s/g, '');
  if (!luhnCheck(cleanCard)) {
    return res.status(400).json({ message: 'Invalid card number. Please check and try again.' });
  }

  if (!validateExpiry(expiryDate)) {
    return res.status(400).json({ message: 'Card has expired or expiry date is invalid' });
  }

  if (!/^\d{3,4}$/.test(cvv)) {
    return res.status(400).json({ message: 'Invalid CVV. Must be 3 or 4 digits.' });
  }

  try {
    const [company] = await pool.query('SELECT id, company_name FROM companies WHERE user_id = ?', [req.user.id]);
    if (company.length === 0) return res.status(404).json({ message: 'Company not found' });

    const reference = `TBA-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const { amount, label } = PRICING[type];
    const lastFour = cleanCard.slice(-4);
    const cardBrand = cleanCard.startsWith('4') ? 'Visa' : cleanCard.startsWith('5') ? 'Mastercard' : cleanCard.startsWith('3') ? 'Amex' : 'Card';

    await pool.query(
      'INSERT INTO transactions (company_id, amount, type, status, reference, description) VALUES (?, ?, ?, ?, ?, ?)',
      [company[0].id, amount, type, 'completed', reference, `${label} (${cardBrand} ending ${lastFour})`]
    );

    res.json({
      message: 'Payment successful',
      reference,
      amount,
      label,
      cardBrand,
      lastFour,
    });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ message: 'Payment processing failed. Please try again.' });
  }
};

exports.handleNotify = async (req, res) => {
  res.status(200).send('OK');
};
