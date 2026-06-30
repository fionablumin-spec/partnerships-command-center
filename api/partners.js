const { queryDatabase } = require('./_notion');

const DB_ID = '41069ad2-d581-82c1-9fa3-07babd4a8cad';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  try {
    const results = await queryDatabase(DB_ID);
    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
