import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
}

export const DIST = path.resolve('dist')

/** The file that answers a URL path, or null. Mirrors Netlify's "pretty URLs": `/versions` serves `versions/index.html`. */
function resolveFile(dist, urlPath) {
  const target = path.resolve(dist, `.${urlPath}`)
  // `startsWith(dist + sep)` and not `startsWith(dist)`, which would also accept a sibling like `dist-old`.
  if (target !== dist && !target.startsWith(dist + path.sep)) return null
  const candidates = [target, path.join(target, 'index.html'), `${target}.html`]
  return candidates.find((file) => fs.existsSync(file) && fs.statSync(file).isFile()) ?? null
}

/**
 * Reads `dist/_redirects`: one rule per line, `from to [status]`, `#` for comments. A trailing `*` in `from`
 * matches any suffix. The default status is 301, as on Netlify.
 * @returns {{ from: string, to: string, status: number }[]}
 */
function readRedirects(dist) {
  const file = path.join(dist, '_redirects')
  if (!fs.existsSync(file)) return []
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [from = '', to = '', status] = line.split(/\s+/)
      return { from, to, status: Number(status ?? 301) }
    })
}

const matches = (from, urlPath) => (from.endsWith('*') ? urlPath.startsWith(from.slice(0, -1)) : from === urlPath)

/**
 * Serves the static build in `dist/` the way Netlify does: a file that exists wins, then the rules of
 * `_redirects` in order (the first match decides), then `404.html` with status 404.
 * Nitro's own `_redirects` ends in a catch-all `/* /404.html 404`, which is why rules must come before it.
 */
export function startServer(dist = DIST) {
  const rules = readRedirects(dist)
  const notFoundPage = path.join(dist, '404.html')
  const send = (res, status, file) => {
    res.writeHead(status, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' })
    fs.createReadStream(file).pipe(res)
  }
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/')
    const file = resolveFile(dist, urlPath)
    if (file) return send(res, 200, file)

    const rule = rules.find((candidate) => matches(candidate.from, urlPath))
    if (rule && rule.status >= 300 && rule.status < 400) {
      res.writeHead(rule.status, { location: rule.to })
      return res.end()
    }
    // A rewrite (200) or a status page (404): serve the target file with the rule's status.
    const target = rule ? resolveFile(dist, rule.to) : null
    if (target) return send(res, rule.status, target)
    if (fs.existsSync(notFoundPage)) return send(res, 404, notFoundPage)
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('Not found')
  })
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = /** @type {import('node:net').AddressInfo} */ (server.address())
      resolve({
        base: `http://127.0.0.1:${port}/`,
        close: () =>
          new Promise((done) => {
            server.closeAllConnections()
            server.close(() => done(undefined))
          }),
      })
    })
  })
}
