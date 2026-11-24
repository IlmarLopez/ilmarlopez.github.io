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

/** Serves the static build in `dist/`. Unknown paths get `404.html` with status 404, as Netlify does. */
export function startServer(dist = DIST) {
  const notFoundPage = path.join(dist, '404.html')
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/')
    const file = resolveFile(dist, urlPath)
    const served = file ?? (fs.existsSync(notFoundPage) ? notFoundPage : null)
    if (!served) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('Not found')
      return
    }
    res.writeHead(file ? 200 : 404, { 'content-type': TYPES[path.extname(served)] ?? 'application/octet-stream' })
    fs.createReadStream(served).pipe(res)
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
