<template>
  <div>
    <section class="section hero is-black is-small">
      <div class="hero-body" />
      <div class="container has-text-centered">
        <img
          id="foxlogo"
          :src="require('../assets/FoxLogov2.png')"
          class="fox-logo"
          width="200"
          height="200"
        >
        <br >
        <h1 class="title">Welcome to Mr.Fox.</h1>
        <p class="subtitle">
          An intelligent, wise, and rather cunning multipurpose bot for
          <strong>Discord</strong>.
        </p>
        <div class="is-hidden-mobile">
          <a
            class="button has-text-centered is-medium is-link is-outlined"
            target="_blank"
            href="https://docs.mrfoxbot.xyz/"
          >
            <span> <font-awesome-icon size="s" icon="book" /> </span>
            <span>&nbsp;View Documentation</span>
          </a>
          &nbsp;
          <nuxt-link
            class="button has-text-centered is-medium is-primary is-outlined"
            to="/servers"
          >
            <span>
              <font-awesome-icon :icon="['fab', 'discord']" size="s" />
            </span>
            <span>&nbsp;Manage Servers</span>
          </nuxt-link>
        </div>
        <nav class="level is-hidden-desktop is-hidden-tablet">
          <div class="level-item has-text-centered">
            <a
              class="button has-text-centered is-medium is-link is-outlined"
              target="_blank"
              href="https://docs.mrfoxbot.xyz/"
            >
              <span> <font-awesome-icon size="s" icon="book" /> </span>
              <span>&nbsp;View Documentation</span>
            </a>
          </div>
          <div class="level-item has-text-centered">
            <nuxt-link
              class="button has-text-centered is-medium is-primary is-outlined"
              to="/servers"
            >
              <span>
                <font-awesome-icon :icon="['fab', 'discord']" size="s" />
              </span>
              <span>&nbsp;Manage Servers</span>
            </nuxt-link>
          </div>
        </nav>
      </div>
      <section class="section">
        <div class="container has-text-centered">
          <a href="https://discordbots.org/bot/333985343445663749">
            <img
              src="https://discordbots.org/api/widget/status/333985343445663749.svg?noavatar=true"
              alt="Mr.Fox"
            >
          </a>
          <a href="https://discordbots.org/bot/333985343445663749">
            <img
              src="https://discordbots.org/api/widget/servers/333985343445663749.svg?noavatar=true"
              alt="Mr.Fox"
            >
          </a>
          <a href="https://discordbots.org/bot/333985343445663749">
            <img
              src="https://discordbots.org/api/widget/upvotes/333985343445663749.svg?noavatar=true"
              alt="Mr.Fox"
            >
          </a>
        </div>
      </section>
    </section>
    <section class="section hero is-grey">
      <div class="hero-body">
        <div class="container">
          <h1 class="title has-text-centered">
            The Fox has arrived, and he's more cunning than ever.
          </h1>
          <p>
            Mr.Fox comes packed with various utilites to improve your server.
            With modularity in mind, Mr.Fox allows you to customize him to your
            liking. From guild settings, to custom permissions, you have a
            plethora of commands and function at your fingertips.
          </p>
          <br >
        </div>
        <div class="container has-text-centered">
          <img
            id="headerimg"
            :src="require('../assets/helplist.png')"
            class="has-text-centered"
            style="border: 5px solid #242424"
            align="center"
          >
        </div>
      </div>
    </section>
    <section class="section hero is-black">
      <div class="hero-body">
        <div class="container">
          <div class="columns">
            <div class="column is-half">
              <p class="title has-text-left">
                Moderation. Keep your server in check.
              </p>
              <p>
                Mr.Fox comes stock with many useful moderation tools that you
                and your moderators can use to keep order and make your server
                more peaceful, from warning and muting, to kicking and banning.
              </p>
            </div>
            <div class="column is-half">
              <figure class="image">
                <img
                  :src="require('../assets/modgif.gif')"
                  style="border: 5px solid #34383c;"
                >
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section hero is-grey">
      <div class="hero-body">
        <div class="container">
          <div class="columns">
            <div class="column is-half">
              <figure class="image">
                <img
                  :src="require('../assets/music.gif')"
                  style="border: 5px solid #242424;"
                >
              </figure>
            </div>
            <div class="column is-half">
              <p class="title has-text-left">YouTube music streaming.</p>
              <p>
                Mr.Fox features a robust YouTube music streamer so you can
                listen to music from your Discord voice channel with your server
                members.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section hero is-black">
      <div class="hero-body">
        <div class="container">
          <div class="columns">
            <div class="column is-half">
              <p class="title has-text-left">Server Leveling.</p>
              <p>
                You and your server members can participate in some friendly
                competition with the included leveling system. Gain experience
                points by chatting in server channels to level up. You can even
                give role rewards when a specific level is reached.
              </p>
            </div>
            <div class="column is-half">
              <figure class="image">
                <img
                  :src="require('../assets/level.gif')"
                  style="border: 5px solid #34383c;"
                >
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section hero is-grey">
      <div class="hero-body">
        <div class="container">
          <div class="columns">
            <div class="column is-half">
              <figure class="image">
                <img id="dashimage" :src="require('../assets/dashpic.png')" >
              </figure>
            </div>
            <div class="column is-half">
              <p class="title has-text-left">User-friendly Dashboard.</p>
              <p>
                Is command syntax too verbose for you? We've got you covered.
                The majority of Mr.Fox's functions are available on our online
                dashboard, for your convenience. Server administrators can have
                access too.
              </p>
            </div>
          </div>
          <br >
          <p align="center" class="title">And much more.</p>
        </div>
      </div>
    </section>
    <footer class="footer" style="background-color: #242424">
      <div class="content has-text-centered">
        <p>© 2017-2018 Fox Dev Team. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style>
#headerimg {
  border-radius: 25px;
}

#dashimage {
  border-radius: 10px;
  border: 3px solid #2b2f33;
}
</style>

<script>
export default {
  auth: false
};
</script>
