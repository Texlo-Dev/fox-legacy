const pkg = require('./package');
require('dotenv').config();

module.exports = {
  mode: 'universal',
  router: {
    middleware: ['auth']
  },
  /*
  ** Headers of the page
  */
  head: {
    title: 'Mr.Fox Bot',
    meta: [
      { charset: 'utf-8' },
      { property: 'og:image', content: '/assets/FoxLogov2.png'},
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: `Mr.Fox is a fully-modular, multipurpose Discord bot that is sure to fit your server needs. Included with Fox, you are given very powerful moderation, music, leveling, and automoderator features at your fingertips. Oh, and he's very cunning, too. Who doesn't like a cunning bot?` }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Raleway'  }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#f37934', height: '4px' },

  /*
  ** Global CSS
  */
  css: [
    '~/assets/global.css'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/slide', ssr: false },
    { src: '~/plugins/vuesax' }
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    '@nuxtjs/dotenv',
    '@nuxtjs/auth',
    'nuxt-buefy',
    ['nuxt-fontawesome', {
      imports: [      
        {
          set: '@fortawesome/free-brands-svg-icons',
          icons: ['faDiscord']
        },
        {
          set: '@fortawesome/free-solid-svg-icons',
          icons: ['faAngleDown']
        }
      ]
      
    }]
  ],
  /*
  ** Discord Oauth
  */
  auth:  {
      strategies: {
          discord: {
            _scheme: 'oauth2',
            authorization_endpoint: 'https://discordapp.com/api/oauth2/authorize',
            userinfo_endpoint: 'https://discordapp.com/api/users/@me',
            scope: ['identify', 'guilds'],
            response_type: 'token',
            token_type: 'Bearer',
            redirect_uri: process.env.REDIRECTURI,
            client_id: process.env.CLIENTID,
            client_secret: process.env.CLIENTSECRET,
            token_key:  'access_token',
            redirect: {
              login: '/login',
              logout: '/',
              home: '/servers',
              user: '/servers',
              callback: '/callback'
            },
            resetOnError: true
          },
      }
  },
  /*
  ** Axios module configuration
  */
  axios: {
    proxy: true
    // See https://github.com/nuxt-community/axios-module#options
  },
  proxy: {
    '/api/': process.env.APIURL
  },
  /*
  ** Build configuration
  */
  build: {
    vendor: ['vue-burger-menu'],
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
