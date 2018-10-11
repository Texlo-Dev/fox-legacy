<template>
  <div>
    <navbar />
	  <dashtabs v-if="isDash && $route.params.guildid" />
    <nuxt/>
  </div>
</template>

<script>
import Navbar from "~/components/Navbar.vue";
import dashtabs from "~/components/DashTabs.vue";
import { mapGetters } from "vuex";

export default {
    components: { Navbar, dashtabs },
    computed: {
        ...mapGetters([
            "loading",
            "isDash"
        ])
    }
};
</script>


<style>



#channel  {
        background-color: rgba(114,137,218,.1);
        color: #7289da;
    }
    #channel:hover { 
        background-color: rgba(114, 137, 218, 0.701961); color: rgb(255, 255, 255); 
    }

    h2 {
    font-family: 'Raleway', 'sans-serif';
}

   h3 {
    font-family: 'Raleway', 'sans-serif';
}

h1 {
  font-family: 'Raleway', 'sans serif';
  text-align: center;
  font-size: 100px;
}

p {
    font-family: 'Raleway', sans-serif;
    word-wrap: break-word;
    color: #eff;
}

.fox-logo {
    border-radius: 75%;
}
.feature {
  text-decoration: underline;

}


.center {
    display: block;
    margin-left: auto;
    margin-right: auto;
}
</style>


<style lang="scss">
@import "~bulma/sass/utilities/_all";

$purple: #8A4D76;
$pink: #FA7C91;
$brown: #757763;
$beige-light: #D0D1CD;
$beige-lighter: #EFF0EB;
$red: #622d01;
$red-invert: findColorInvert($red);
$black: #23272A;
$black-invert: findColorInvert($black);
$grey:#34383c;
$grey-invert: findColorInvert($grey);
$primary: #f37934;
$primary-invert: findColorInvert($primary);
$pink-invert: findColorInvert($pink);


  // Update Bulma's global variables
$colors: (
  "white": ($white, $black),
  "link": ($link, $link-invert),
  "warning": ($warning, $warning-invert),
  "black": ($black, $black-invert),
  "danger": ($red, $red-invert),
  "pink": ($pink, $pink-invert),
  "grey": ($grey, $grey-invert),
  "primary": ($primary, $primary-invert),
  "success": ($success, $success-invert),
  "light": ($light, $light-invert)
);


// Update some of Bulma's component variables
$tabs-link-color: #eff0eb;
$tabs-link-active-color: #eff0eb;
$tabs-border-bottom-color: #363636;
$tabs-link-active-border-bottom-color: $red;
$tabs-link-hover-border-bottom-color: $red;
$tabs-link-hover-color: #eff0eb;
$tabs-toggle-link-border-width: 3px;
$tabs-border-bottom-width: 0.5px;
$body-background-color: $grey;
$table-background-color: $black;
$footer-background-color: $grey;
$control-border-width: 2px;
$input-border-color: #363636;
$input-shadow: none;
$table-row-active-color: #242424;
$table-cell-border-color: #242424;
$box-background-color: #2b2f33;
$box-color: #eff0eb;
$switch-focus: none;
$checkradio-focus: none;
$tabs-link-color: #eff0eb;
$tabs-link-active-color: #eff0eb;
$tabs-border-bottom-color: #363636;
$tabs-link-active-border-bottom-color: $red;
$tabs-link-hover-border-bottom-color: $red;
$tabs-link-hover-color: #eff0eb;
$tabs-border-bottom-width: 0.5px;
$input-background-color: $black;
$input-focus-border-color: #363636;
$input-color: #eff;
$input-focus-color: #363636;
$input-hover-border-color: #363636;
$modal-card-head-background-color:  #34383c;;
$modal-card-head-border-bottom: 0px;
$modal-card-foot-border-top: 0px;
$modal-card-body-background-color: #34383c;
$modal-card-title-color: #eff0eb;
$menu-item-active-background-color: $primary;
$menu-item-hover-background-color: $grey;

// Import Bulma and Buefy styles
@import "~bulma";
@import "~buefy/src/scss/buefy";
@import "~bulma-extensions/bulma-divider/src/sass/index.sass";
</style>

<style>
html
{
  font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}
*, *:before, *:after
{
  box-sizing: border-box;
  margin: 0;
}
.button--green
{
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #3b8070;
  color: #3b8070;
  text-decoration: none;
  padding: 10px 30px;
}
.button--green:hover
{
  color: #fff;
  background-color: #3b8070;
}
.button--grey
{
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}
.button--grey:hover
{
  color: #fff;
  background-color: #35495e;
}

.input {
  background-color: #2b2f33;
  border-radius: 5px
}

.textarea {
  background-color: #2b2f33;
  border-radius: 10px;
}

</style>
