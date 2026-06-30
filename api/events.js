const { queryDatabase } = require('./_notion');

const DB_ID = 'a2c57a42-d150-4122-8d49-6171df042081';

const FILTER = {
  or: [
    { property: 'Type', select: { equals: 'CE Event' } },
    { property: 'Type', select: { equals: 'CE Networking Event' } },
    { property: 'Type', select: { equals: 'Live Webinar' } },
  ],
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  try {
    const results = await queryDatabase(DB_ID, FILTER);
    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
