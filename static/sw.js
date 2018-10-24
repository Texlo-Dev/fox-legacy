importScripts('/_nuxt/workbox.4c4f5ca6.js')



workbox.precaching.precacheAndRoute([
  {
    "url": "/_nuxt/0dff2a986ebd5bbc1ede.js",
    "revision": "4b094d7ab820c613b6cee608e14a7b40"
  },
  {
    "url": "/_nuxt/1c576b14e67d1b1bf446.js",
    "revision": "7aac2ea8a2f2e41b4a0c85ea0fc98764"
  },
  {
    "url": "/_nuxt/35ad2ea2ee5bbca33952.js",
    "revision": "40bdb29fe39af82f366e93634453974c"
  },
  {
    "url": "/_nuxt/37e5e88d9c273c4e27c2.js",
    "revision": "a1c92be4a400bb3779834d3bc29358ef"
  },
  {
    "url": "/_nuxt/3a4cc6b484164d756400.js",
    "revision": "4e796d0f15edf2664bebc4865410f83e"
  },
  {
    "url": "/_nuxt/3a5f3ddd3120fe4c6a47.js",
    "revision": "c9d644bc6af726b9ef63a3d953769017"
  },
  {
    "url": "/_nuxt/425251eafff136470464.js",
    "revision": "c52d72974635df70514a7e7aa3af23d7"
  },
  {
    "url": "/_nuxt/460984419f7d0baeacad.js",
    "revision": "c11f98af9ffaf17d658d8ef96ac62e2a"
  },
  {
    "url": "/_nuxt/50ae65efb203b51d6b2f.js",
    "revision": "20ec461b3490a05e20d1ed62d525a614"
  },
  {
    "url": "/_nuxt/5f7a811489e1585c5f7d.js",
    "revision": "32887981e0fbc60aa708905274c6467e"
  },
  {
    "url": "/_nuxt/7040f9b93ea75bda6370.js",
    "revision": "2e3cb58229863dc1545dc44780b873ef"
  },
  {
    "url": "/_nuxt/747f76ac6bbace24c565.js",
    "revision": "92d93d28c2abce7a9e4d0dd0bddcf974"
  },
  {
    "url": "/_nuxt/76ae687d847c27ee4b8d.js",
    "revision": "d1198e195341dc249c53ba77514abf97"
  },
  {
    "url": "/_nuxt/89abfddbe5d080eff9b8.js",
    "revision": "e3dd360e2b1b863d98997f23a5d3d1c7"
  },
  {
    "url": "/_nuxt/8bc645c6c155e01a4035.css",
    "revision": "e2a0673b5e0750ac7f5da3aeba7cf1a8"
  },
  {
    "url": "/_nuxt/9c75f78dea77466fa7dc.js",
    "revision": "2be79dab61470e8feb78eb838baa0e94"
  },
  {
    "url": "/_nuxt/9ff60f4d718215b9c93b.js",
    "revision": "b67aba2df29422485f1d63f84bf30695"
  },
  {
    "url": "/_nuxt/a123a240810fcd905b04.js",
    "revision": "49c138f73cc6e12d6ec6b1e7ce0eddd1"
  },
  {
    "url": "/_nuxt/aaeabfac05e21c40db6a.js",
    "revision": "2e646384bd2d91496c65390ae16bdec1"
  },
  {
    "url": "/_nuxt/c73bf308a0dda1c63988.js",
    "revision": "1e134df2193dee4e5b31ed408bc297cb"
  },
  {
    "url": "/_nuxt/d7930028c9ea6bdbc0d7.js",
    "revision": "0b6bc47e9044293f43b0d35d8aec20f1"
  },
  {
    "url": "/_nuxt/deae32b966c7116e9eeb.js",
    "revision": "41e49f1ae4aa4708fcb66c3a4635cec6"
  },
  {
    "url": "/_nuxt/dfc8de51d4b89ad6a89b.js",
    "revision": "8b549bf6207657d4b73746fa95224058"
  },
  {
    "url": "/_nuxt/f57c5387eb60c18b6c1e.js",
    "revision": "dc6ebc201b135e1ccca9f7982782d8a6"
  }
], {
  "cacheId": "Mr.Fox",
  "directoryIndex": "/",
  "cleanUrls": false
})



workbox.clientsClaim()
workbox.skipWaiting()


workbox.routing.registerRoute(new RegExp('/_nuxt/.*'), workbox.strategies.cacheFirst({}), 'GET')

workbox.routing.registerRoute(new RegExp('/.*'), workbox.strategies.networkFirst({}), 'GET')





