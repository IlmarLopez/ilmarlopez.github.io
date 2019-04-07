importScripts('/_nuxt/workbox.4c4f5ca6.js')

workbox.precaching.precacheAndRoute([
  {
    "url": "/_nuxt/516a0262d7d1a087be64.js",
    "revision": "38d99b52af4373974126e29851bde900"
  },
  {
    "url": "/_nuxt/710df41f74f41da6fdca.js",
    "revision": "4dac457741c12fd895fdbaddc5ff8b08"
  },
  {
    "url": "/_nuxt/7698d39e4749710c1ff6.js",
    "revision": "60354723d0e7fb33c4a55856173409f1"
  },
  {
    "url": "/_nuxt/eb9b33492de5502b15bc.js",
    "revision": "2fff94d5cd5b7695920f6ff59a054f7a"
  }
], {
  "cacheId": "official-website",
  "directoryIndex": "/",
  "cleanUrls": false
})

workbox.clientsClaim()
workbox.skipWaiting()

workbox.routing.registerRoute(new RegExp('/_nuxt/.*'), workbox.strategies.cacheFirst({}), 'GET')

workbox.routing.registerRoute(new RegExp('/.*'), workbox.strategies.networkFirst({}), 'GET')
