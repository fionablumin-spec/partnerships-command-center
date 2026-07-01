const { queryDatabase } = require('./_notion');

const DB_ID = '5b369ad2-d581-83c4-b2a0-81078546b6e1';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  try {
    const results = await queryDatabase(DB_ID);
    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
