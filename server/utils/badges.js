const pool = require('../config/db');
const { notify } = require('./notify');

const BADGES = {
  profile_complete: 'Profile Complete',
  first_application: 'First Application',
  first_interview: 'First Interview',
  first_offer: 'First Offer',
  github_connected: 'GitHub Connected',
  first_verified_skill: 'First Verified Skill',
  first_project: 'First Project',
};

// Idempotent: the UNIQUE(user_id, badge) key makes re-awards a no-op.
async function awardBadge(userId, badge) {
  if (!BADGES[badge]) return;
  try {
    const [result] = await pool.query(
      'INSERT IGNORE INTO user_badges (user_id, badge) VALUES (?, ?)',
      [userId, badge]
    );
    if (result.affectedRows > 0) {
      await notify(userId, 'badge', `Achievement unlocked: ${BADGES[badge]}!`, '/student/readiness');
    }
  } catch (err) {
    console.error('Badge award failed:', err.message);
  }
}

module.exports = { awardBadge, BADGES };
