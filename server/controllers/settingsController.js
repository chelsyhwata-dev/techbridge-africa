const pool = require('../config/db');

exports.getBankingDetails = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM platform_settings');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    res.json(settings);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBankingDetails = async (req, res) => {
  const { bankName, accountHolder, accountNumber, branchCode, accountType, paymentInstructions } = req.body;

  try {
    const updates = [
      ['bank_name', bankName],
      ['account_holder', accountHolder],
      ['account_number', accountNumber],
      ['branch_code', branchCode],
      ['account_type', accountType],
      ['payment_instructions', paymentInstructions],
    ];

    for (const [key, value] of updates) {
      await pool.query(
        'INSERT INTO platform_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, value || '', value || '']
      );
    }

    res.json({ message: 'Banking details updated' });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPublicBankingDetails = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT setting_key, setting_value FROM platform_settings WHERE setting_key IN ('bank_name', 'account_holder', 'account_number', 'branch_code', 'account_type', 'payment_instructions')"
    );
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });

    if (!settings.bank_name || !settings.account_number) {
      return res.json({ configured: false });
    }

    res.json({ configured: true, ...settings });
  } catch (err) {
    console.error('Get public banking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
