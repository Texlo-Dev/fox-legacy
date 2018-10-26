importScripts("/_nuxt/workbox.4c4f5ca6.js");

workbox.precaching.precacheAndRoute(
  [
    {
      url: "/_nuxt/app.js",
      revision: "f42003e5232c348f0c5d90270bee35ae"
    },
    {
      url: "/_nuxt/cac9f5ce002157d2b127.css",
      revision: "2cdb1d8f22e156fba1ad65344ea13524"
    },
    {
      url: "/_nuxt/commons.app.js",
      revision: "cb30de237fca83b6502dd334736771a0"
    },
    {
      url: "/_nuxt/pages/getstarted.js",
      revision: "a7b97f37c378f3253c6d32c301f39c95"
    },
    {
      url: "/_nuxt/pages/index.js",
      revision: "2e3cb58229863dc1545dc44780b873ef"
    },
    {
      url: "/_nuxt/pages/permissions.js",
      revision: "4f9a868b90c340aa12af99c0d7519024"
    },
    {
      url: "/_nuxt/pages/s.js",
      revision: "4b815b146eec0de2ba6a5c94fd6ef53c"
    },
    {
      url: "/_nuxt/pages/servers/_guildid/automod.js",
      revision: "8b549bf6207657d4b73746fa95224058"
    },
    {
      url: "/_nuxt/pages/servers/_guildid/core.js",
      revision: "d1198e195341dc249c53ba77514abf97"
    },
    {
      url: "/_nuxt/pages/servers/_guildid/economy.js",
      revision: "1e134df2193dee4e5b31ed408bc297cb"
    },
    {
      url: "/_nuxt/pages/servers/_guildid/fun.js",
      revision: "dc6ebc201b135e1ccca9f7982782d8a6"
    },
    {
      url: "/_nuxt/pages/servers/_guildid/games.js",
      revision: "92d93d28c2abce7a9e4d0dd0bddcf974"
    },
    {
      url: "/_nuxt/pages/servers/_guildid/giveaways.js",
      revision: "49c138f73cc6e12d6ec6b1e7ce0eddd1"
    },
    {
      url: "/_nuxt/pages/servers/_guildid/leveling.js",
      revision: "c11f98af9ffaf17d658d8ef96ac62e2a"
    },
    {
      url: "/_nuxt/pages/servers/_guildid/moderation.js",
      revision: "4b094d7ab820c613b6cee608e14a7b40"
    },
    {
      url: "/_nuxt/pages/servers/_guildid/music.js",
      revision: "c9d644bc6af726b9ef63a3d953769017"
    },
    {
      url: "/_nuxt/pages/servers/_guildid/permissions.js",
      revision: "c52d72974635df70514a7e7aa3af23d7"
    },
    {
      url: "/_nuxt/pages/servers/_guildid/polls.js",
      revision: "20ec461b3490a05e20d1ed62d525a614"
    },
    {
      url: "/_nuxt/pages/servers/_guildid/reaction roles.js",
      revision: "2e646384bd2d91496c65390ae16bdec1"
    },
    {
      url: "/_nuxt/pages/servers/_guildid/self roles.js",
      revision: "41e49f1ae4aa4708fcb66c3a4635cec6"
    },
    {
      url: "/_nuxt/pages/servers/_guildid/tags.js",
      revision: "e3dd360e2b1b863d98997f23a5d3d1c7"
    },
    {
      url: "/_nuxt/pages/servers/_guildid/welcomer.js",
      revision: "40bdb29fe39af82f366e93634453974c"
    },
    {
      url: "/_nuxt/runtime.js",
      revision: "a77797e48c73b1f92a7d81ab1884f657"
    },
    {
      url: "/_nuxt/styles.js",
      revision: "e43a3879d31dc4ce064fafa74e5f3353"
    }
  ],
  {
    cacheId: "Mr.Fox",
    directoryIndex: "/",
    cleanUrls: false
  }
);

workbox.clientsClaim();
workbox.skipWaiting();

workbox.routing.registerRoute(
  new RegExp("/_nuxt/.*"),
  workbox.strategies.cacheFirst({}),
  "GET"
);

workbox.routing.registerRoute(
  new RegExp("/.*"),
  workbox.strategies.networkFirst({}),
  "GET"
);
