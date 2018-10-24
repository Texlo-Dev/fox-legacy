import dotenv from 'dotenv';
dotenv.config();
global.File = typeof window === 'undefined' ? Object : window.File;
export default {
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
    bodyAttrs: { class: 'has-navbar-fixed-top'},
    meta: [
      { charset: 'utf-8' },
      { property: 'og:image', content: '/FoxLogov2.png'},
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#f37934'},
      { hid: 'description', name: 'description', content: `Mr.Fox is a fully-modular, multipurpose Discord bot that is sure to fit your server needs. Included with Fox, you are given very powerful moderation, music, leveling, and automoderator features at your fingertips. Oh, and he's very cunning, too. Who doesn't like a cunning bot?` }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Raleway|Poppins' }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#f37934', height: '3px' },

  /*
  ** Global CSS
  */
  css: [
    '@/assets/global.css'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/vuecharts', ssr: false }
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    '@nuxtjs/sitemap',
    '@nuxtjs/auth',
    '@nuxtjs/dotenv',
    ['nuxt-buefy', {
      materialDesignIcons: false
    }],
    '@nuxtjs/pwa',
    /*[
      'nuxt-bulma-slim',
      {
        variablesPath: 'assets/scss/styles.scss'
      }
    ],*/
    ['nuxt-validate', {
      lang: 'en'
    }],
    ['nuxt-fontawesome', {
      imports: [      
        {
          set: '@fortawesome/free-brands-svg-icons',
          icons: ['faDiscord']
        },
        {
          set: '@fortawesome/free-solid-svg-icons',
          icons: ['faAngleDown', 'faPlus', 'faEdit', 'faBook', 'faWrench', 'faCogs', 'faTrashAlt', 'faRedo', 'faBan', 'faPause', 'faPlay', 'faStop', 'faServer', 'faSignOutAlt']
        }
      ]
      
    }]
  ],
  sitemap: {
    exclude: [
      '/callback',
      '/serveradd',
      '/s'
    ]
  },
  /*
  ** Discord Oauth
  */
  auth:  {
    rewriteRedirects: true,
    redirect: {
      login: '/login',
      logout: '/s',
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
  manifest: {
    name: 'Mr.Fox Bot',
    background_color: '#f37934',
    lang: 'en',
    start_url: '/s'
  },
  meta: {
    name: 'Mr.Fox',
    title: 'Mr.Fox Bot',
    description: 'A fully-modular, multipurpose bot for Discord. Which happens to be very cunning.'
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
    extractCSS: true,
    optimization: {
      splitChunks: {
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.(css|vue)$/,
            chunks: 'all',
            enforce: true
          }
        }
      }
    },
    extend(config) {
      config.resolve.alias['chart.js'] = 'chart.js/dist/Chart.js'
    }
  }
}
