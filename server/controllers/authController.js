const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

exports.register = async (req, res) => {
  const { name, email, password, role, referralCode } = req.body;

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = ['student', 'company', 'university'].includes(role) ? role : 'student';

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, userRole]
    );

    const userId = result.insertId;

    if (userRole === 'student') {
      await pool.query('INSERT INTO students (user_id, skills) VALUES (?, ?)', [userId, JSON.stringify([])]);
    } else if (userRole === 'company') {
      const companyName = req.body.companyName || name;
      await pool.query('INSERT INTO companies (user_id, company_name) VALUES (?, ?)', [userId, companyName]);
    } else if (userRole === 'university') {
      const universityName = req.body.universityName || name;
      await pool.query('INSERT INTO universities (user_id, university_name) VALUES (?, ?)', [userId, universityName]);
    }

    if (referralCode) {
      const [referral] = await pool.query('SELECT referrer_user_id FROM referrals WHERE code = ? LIMIT 1', [referralCode]);
      if (referral.length > 0 && referral[0].referrer_user_id !== userId) {
        await pool.query('INSERT INTO referrals (referrer_user_id, code, referred_user_id) VALUES (?, ?, ?)', [referral[0].referrer_user_id, referralCode, userId]);
      }
    }

    const token = generateToken({ id: userId, role: userRole });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: userId, name, email, role: userRole },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profile_image,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === 'student') {
      const [rows] = await pool.query('SELECT * FROM students WHERE user_id = ?', [user.id]);
      profile = rows[0] || null;
    } else if (user.role === 'company') {
      const [rows] = await pool.query('SELECT * FROM companies WHERE user_id = ?', [user.id]);
      profile = rows[0] || null;
    } else if (user.role === 'university') {
      const [rows] = await pool.query('SELECT * FROM universities WHERE user_id = ?', [user.id]);
      profile = rows[0] || null;
    }

    res.json({ user, profile });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
