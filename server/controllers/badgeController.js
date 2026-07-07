const pool = require('../config/db');
const { BADGES } = require('../utils/badges');

// Gamification (PRD 11.4): profile-completion + achievement badges. Intentionally
// minimal — no XP economy or daily missions in V1.
exports.getMyBadges = async (req, res) => {
  try {
    const [earned] = await pool.query('SELECT badge, earned_at FROM user_badges WHERE user_id = ? ORDER BY earned_at DESC', [req.user.id]);
    const earnedSet = new Set(earned.map((e) => e.badge));

    const all = Object.entries(BADGES).map(([key, label]) => ({
      key,
      label,
      earned: earnedSet.has(key),
      earnedAt: earned.find((e) => e.badge === key)?.earned_at || null,
    }));

    res.json(all);
  } catch (err) {
    console.error('Get badges error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
