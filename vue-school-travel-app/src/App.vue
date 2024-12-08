<template>
  <HomeView v-if="isHomePage" />
  <router-view />
</template>
<script setup>
import HomeView from "./views/HomeView.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";
const route = useRoute();
const isHomePage = computed(() => route.path === "/" || route.path === "/home");
</script>
<style>
/* 引入一个图片作为背景，平铺整个面 ，vue模板中*/
body {
  background-image: url("./assets/bg2.jpg");
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
