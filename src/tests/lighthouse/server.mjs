// Minimal static server for Lighthouse CI runs.
// Serves repo root + mocks /main_server/* with a canned BMLT response so
// Lighthouse gets a deterministic, hermetic page to audit.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const PORT = Number(process.env.LH_PORT ?? 4175);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.map': 'application/json; charset=utf-8'
};

const MOCK_RESPONSE = {
  meetings: [
    {
      id_bigint: '1',
      weekday_tinyint: '2',
      start_time: '19:00:00',
      duration_time: '01:00:00',
      venue_type: '1',
      meeting_name: 'Monday Serenity Group',
      location_text: 'Community Center',
      location_street: '123 Main St',
      location_municipality: 'Anytown',
      location_province: 'CA',
      location_postal_code_1: '90210',
      latitude: '34.05',
      longitude: '-118.24',
      published: '1',
      service_body_bigint: '1',
      service_body_name: 'Metro Area',
      format_shared_id_list: '1',
      comments: '',
      email_contact: ''
    }
  ],
  formats: [{ id: '1', key_string: 'O', name_string: 'Open', description_string: 'Open to all', lang: 'en' }]
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

  if (url.pathname.startsWith('/main_server/')) {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(MOCK_RESPONSE));
    return;
  }

  const rel = url.pathname === '/' ? '/src/tests/lighthouse/fixture.html' : url.pathname;
  const filePath = join(ROOT, rel);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403).end();
    return;
  }

  try {
    const s = await stat(filePath);
    if (!s.isFile()) throw new Error('not a file');
    const body = await readFile(filePath);
    res.writeHead(200, { 'content-type': MIME[extname(filePath)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
  }
});

server.listen(PORT, () => {
  console.log(`lighthouse fixture server on http://localhost:${PORT}`);
});
