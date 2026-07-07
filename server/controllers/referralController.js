const pool = require('../config/db');
const crypto = require('crypto');

// Referral System (PRD 11.3): simple trackable links, lightweight reward.
exports.getMyCode = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT code FROM referrals WHERE referrer_user_id = ? LIMIT 1', [req.user.id]);
    if (existing.length > 0) return res.json({ code: existing[0].code });

    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    await pool.query('INSERT INTO referrals (referrer_user_id, code, referred_user_id) VALUES (?, ?, NULL)', [req.user.id, code]);
    res.status(201).json({ code });
  } catch (err) {
    console.error('Get referral code error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyStats = async (req, res) => {
  try {
    const [[{ totalReferred }]] = await pool.query(
      'SELECT COUNT(*) as totalReferred FROM referrals WHERE referrer_user_id = ? AND referred_user_id IS NOT NULL',
      [req.user.id]
    );
    res.json({ totalReferred, reward: totalReferred > 0 ? 'Profile boost active' : null });
  } catch (err) {
    console.error('Referral stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
