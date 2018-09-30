require('dotenv').config();

module.exports = {
  

  mode: 'universal',
  router: {
    middleware: ['auth']
  },
  messages: {
    server_error: 'A server error has occurred.',
    nuxtjs: 'Mr.Fox',
    back_to_home: 'Return to safety',
    server_error_details: 'Fox is having an off day. We all have them.',
},
  /*
  ** Headers of the page
  */
  head: {
    title: 'Mr.Fox - The multipurpose, cunning Discord Bot.',
    meta: [
      { charset: 'utf-8' },
      { property: 'og:image', content: '/FoxLogov2.png'},
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
  loading: { color: '#61bd4f', height: '3px' },

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
    { src: '~/plugins/vuesax' },
    { src: '~/plugins/moment'}
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
          icons: ['faAngleDown', 'faPlus', 'faEdit', 'faWrench', 'faCogs', 'faTrashAlt', 'faRedo', 'faBan', 'faPause', 'faPlay']
        }
      ]
      
    }]
  ],
  /*
  ** Discord Oauth
  */
  auth:  {
    rewriteRedirects: true,
    redirect: {
      login: '/login',
      logout: '/',
      home: '/servers',
      callback: '/callback'
    },
      strategies: {
          discord: {
            _scheme: 'oauth2',
            authorization_endpoint: 'https://discordapp.com/api/oauth2/authorize',
            userinfo_endpoint: 'https://discordapp.com/api/users/@me',
            scope: ['identify', 'guilds', 'guilds.join'],
            response_type: 'token',
            token_type: 'Bearer',
            redirect_uri: process.env.REDIRECTURI,
            client_id: process.env.CLIENTID,
            client_secret: process.env.CLIENTSECRET,
            token_key:  'access_token',
            resetOnError: true
          },
      },
      plugins: [
        '~/plugins/auth' 
      ]
  },
  /*
  ** Axios module configuration
  */
  axios: {
    proxy: true,
    proxyHeaders: false
    // See https://github.com/nuxt-community/axios-module#options
  },
  proxy: {
    '/api/': process.env.APIURL
  },
  /*
  ** Build configuration
  */
  build: {
    babel: {
      presets: [
          [
              '@nuxtjs/babel-preset-app',
              {targets: {ie: '11'}}
          ]
      ]
    },
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
