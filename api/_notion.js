const https = require('https');

function notionRequest(path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.notion.com',
      path,
      method: body ? 'POST' : 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(options, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function flattenPage(page) {
  const out = { _id: page.id, url: page.url };
  for (const [key, prop] of Object.entries(page.properties || {})) {
    switch (prop.type) {
      case 'title':
        out[key] = prop.title.map(t => t.plain_text).join('');
        break;
      case 'rich_text':
        out[key] = prop.rich_text.map(t => t.plain_text).join('') || null;
        break;
      case 'number':
        out[key] = prop.number;
        break;
      case 'select':
        out[key] = prop.select?.name || null;
        break;
      case 'status':
        out[key] = prop.status?.name || null;
        break;
      case 'multi_select':
        // Serialize as JSON string to match cowork tool behavior
        out[key] = JSON.stringify(prop.multi_select.map(s => s.name));
        break;
      case 'checkbox':
        out[key] = prop.checkbox ? '__YES__' : '__NO__';
        break;
      case 'date':
        out[`date:${key}:start`] = prop.date?.start || null;
        out[`date:${key}:end`] = prop.date?.end || null;
        break;
      case 'url':
        out[key] = prop.url;
        break;
      case 'email':
        out[key] = prop.email;
        break;
      case 'formula':
        out[key] = prop.formula ? prop.formula[prop.formula.type] : null;
        break;
      case 'rollup':
        if (prop.rollup?.type === 'number') out[key] = prop.rollup.number;
        else if (prop.rollup?.type === 'array') {
          out[key] = JSON.stringify(prop.rollup.array.map(i =>
            i.type === 'title' ? i.title.map(t => t.plain_text).join('') :
            i.type === 'rich_text' ? i.rich_text.map(t => t.plain_text).join('') :
            i[i.type]
          ));
        }
        break;
      case 'relation':
        out[key] = prop.relation.map(r => r.id);
        break;
      case 'people':
        out[key] = prop.people.map(p => p.name || p.id).join(', ');
        break;
      default:
        out[key] = null;
    }
  }
  return out;
}

async function queryDatabase(databaseId, filter) {
  const results = [];
  let cursor = undefined;
  do {
    const body = { page_size: 100, ...(filter ? { filter } : {}), ...(cursor ? { start_cursor: cursor } : {}) };
    const res = await notionRequest(`/v1/databases/${databaseId}/query`, body);
    if (res.object === 'error') throw new Error(res.message);
    results.push(...(res.results || []).map(flattenPage));
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return results;
}

module.exports = { queryDatabase };
