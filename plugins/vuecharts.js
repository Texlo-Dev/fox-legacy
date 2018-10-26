import Vue from "vue";
import { Pie, Doughnut } from "vue-chartjs";

Vue.component("pie-chart", {
  extends: Pie,
  props: ["data", "options"],
  mounted() {
    this.renderChart(this.data, this.options);
  }
});

Vue.component("doughnut-chart", {
  extends: Doughnut,
  props: ["data", "options"],
  mounted() {
    this.renderChart(this.data, this.options);
  }
});
