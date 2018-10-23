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
.input {
	background-color: #2b2f33;
}

.textarea {
	background-color: #2b2f33;
	border-radius: 10px;
}
#modalselect {
  background-color: #2b2f33;
}
.modal-card-foot .button {
  font-family: 'Poppins'
}
</style>


<style lang="scss">
@import "~bulma/sass/utilities/_all";

$purple: #8A4D76;
$pink: #FA7C91;
$brown: #757763;
$beige-light: #D0D1CD;
$beige-lighter: #EFF0EB;
$red: #ff4136;
$red-invert: findColorInvert($red);
$black: #23272A;
$black-invert: findColorInvert($black);
$grey:#34383c;
$grey-darker: #2b2f33;
$grey-darker-invert: findColorInvert($grey-darker);
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
  "grey-darker": ($grey-darker, $grey-darker-invert),
  "primary": ($primary, $primary-invert),
  "success": ($success, $success-invert),
  "light": ($light, $light-invert)
);


// Update some of Bulma's component variables
$dropdown-content-background-color: $grey-darker;
$dropdown-item-hover-color: $grey;
$tabs-link-color: #eff0eb;
$tabs-link-active-color: #eff0eb;
$tabs-border-bottom-color: #363636;
$tabs-link-active-border-bottom-color: $red;
$tabs-link-hover-border-bottom-color: $red;
$tabs-link-hover-color: #eff0eb;
$tabs-toggle-link-border-width: 3px;
$tabs-border-bottom-width: 0.5px;
$body-background-color: $grey;
$table-background-color: $grey-darker;
$footer-background-color: $grey;
$control-border-width: 2px;
$input-border-color: #363636;
$input-background-color: #2b2f33;
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
$tabs-link-active-border-bottom-color: $primary;
$tabs-link-hover-border-bottom-color: $primary;
$tabs-link-hover-color: #eff0eb;
$tabs-border-bottom-width: 0.5px;
$input-background-color: $black;
$input-focus-border-color: #363636;
$input-color: #eff;
$input-focus-color: #363636;
$input-hover-border-color: #363636;
$modal-card-head-background-color:  #2b2f33;
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


