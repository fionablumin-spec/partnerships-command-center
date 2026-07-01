const { queryDatabase } = require('./_notion');

const DB_ID = 'b3fab4b8-b530-443c-a3b7-5282ff370087';

const FILTER = {
  or: [
    { property: 'Type', select: { equals: 'CE Event' } },
    { property: 'Type', select: { equals: 'CE Networking Event' } },
    { property: 'Type', select: { equals: 'Live Webinar' } },
  ],
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  try {
    const results = await queryDatabase(DB_ID, FILTER);
    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
