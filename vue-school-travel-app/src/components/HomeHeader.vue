<template>
  <div class="home">
    <router-link to="/register"><button>注册</button></router-link>
    <router-link to="/login"><button>登录</button></router-link>
  </div>
  <div class="welcome">欢迎来到表情符号管理系统</div>
</template>
<script setup></script>
<style scoped>
/* 两个按钮并列放在顶部的最右侧 */
.home {
  position: fixed; /* 固定定位 */
  top: 20px; /* 距离顶部 20px */
  right: 20px; /* 距离右边 20px */
  display: flex; /* 使用 Flexbox 对齐 */
  gap: 15px; /* 按钮之间的间距 */
}

button {
  padding: 10px 20px; /* 内边距 */
  background-color: #4caf50; /* 背景色 */
  color: white; /* 文字颜色 */
  text-decoration: none; /* 去掉链接下划线 */
  border-radius: 5px; /* 圆角 */
  font-size: 16px; /* 字体大小 */
  transition: background-color 0.3s ease; /* 动画效果 */
}

button:hover {
  background-color: #45a049; /* 悬停时背景颜色 */
}

.welcome {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  color: #3dbbc4;
}
</style>
