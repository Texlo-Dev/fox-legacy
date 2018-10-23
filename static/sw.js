importScripts('/_nuxt/workbox.4c4f5ca6.js')



workbox.precaching.precacheAndRoute([
  {
    "url": "/_nuxt/12f79af89cc7093e0aa9.css",
    "revision": "92676af77cbd075bf353669e919bbd46"
  },
  {
    "url": "/_nuxt/161d97c410dd6ec6a8b9.js",
    "revision": "3d1bbb800545cb7202456947f1136530"
  },
  {
    "url": "/_nuxt/23be40c24b83a161c58e.js",
    "revision": "8c8011daec68f7470c902a6e33136390"
  },
  {
    "url": "/_nuxt/3641ffa7002836e61edc.js",
    "revision": "bc93e8d1cea1c02f6b57a8ed4e3befc8"
  },
  {
    "url": "/_nuxt/3aa59ca19bcfa3a83378.js",
    "revision": "19b1565e639b2bf0fc93ffabf7e18c86"
  },
  {
    "url": "/_nuxt/4ba7bd971d392fe43d32.js",
    "revision": "a7b97f37c378f3253c6d32c301f39c95"
  },
  {
    "url": "/_nuxt/4c56efc1fa9234b19db7.js",
    "revision": "cba5e156e7b070cd5684550d6efe83a4"
  },
  {
    "url": "/_nuxt/64f57d7632c77658ded7.js",
    "revision": "0a935bb3ad2d7c50379c5645ba570445"
  },
  {
    "url": "/_nuxt/6d5a44c95c2f977cfa61.js",
    "revision": "ad95cdad68bfad5288f6a91bddc0eb9f"
  },
  {
    "url": "/_nuxt/72fd87dda01602a585cc.js",
    "revision": "26ecff8b5527367b585dd3250140bfb3"
  },
  {
    "url": "/_nuxt/773ae1c220f81c2bb8aa.js",
    "revision": "5dd97106536ed0a6388cabe422adb816"
  },
  {
    "url": "/_nuxt/8e7f44fed56f47ae69f4.js",
    "revision": "a36ee537ed0b97cc931db4552769c411"
  },
  {
    "url": "/_nuxt/97ebec6e4b02d677f50d.js",
    "revision": "048d07f74c98166a2cda80f069b55b43"
  },
  {
    "url": "/_nuxt/9c253ea6e16ff5f8c494.js",
    "revision": "bceb4c846284be7b879ae3a5adbcc755"
  },
  {
    "url": "/_nuxt/a554d7cffa1101ebca02.js",
    "revision": "d5f8e47f33050f28c7f7135af6d1ca51"
  },
  {
    "url": "/_nuxt/b1311e04551911aa5178.js",
    "revision": "4a91f76e83f6db821b81c41d39ec361a"
  },
  {
    "url": "/_nuxt/c26882188f17d2423fcd.js",
    "revision": "994717ad3d47c766e5a8eb35225ae11d"
  },
  {
    "url": "/_nuxt/dc7a099b68bc3f6e43eb.js",
    "revision": "ade1ed1a7067c44b89a53bedb11b99e2"
  },
  {
    "url": "/_nuxt/e1f8c6cebc686cba73ff.js",
    "revision": "52134081cb5665b095cad2af8074be98"
  },
  {
    "url": "/_nuxt/e60e35cfcd17d1870223.js",
    "revision": "9f3f017b6007298d304419e3c2d3c0d9"
  },
  {
    "url": "/_nuxt/ee6452a725339425bbb2.js",
    "revision": "3cf859b6fdd486f9dabcaeb96577ef56"
  },
  {
    "url": "/_nuxt/faa88fab2709455cf600.js",
    "revision": "2eb9598f18c3a9fc73aba90ee136ad92"
  },
  {
    "url": "/_nuxt/fb8396d3883f37da194a.js",
    "revision": "955794a7f22dba3bcd6e6a75f11f1bfd"
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





