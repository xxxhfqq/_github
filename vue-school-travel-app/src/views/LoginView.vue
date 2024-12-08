<template>
  <div class="login">
    <router-link to="/"><button>主页</button></router-link>
    <router-link to="/register"><button>注册</button></router-link>
  </div>
  <div class="login-page">
    <div class="header">
      <h1>登录</h1>
    </div>
    <div class="main">
      <button @click="identity = false" :style="selected1">用户</button>
      <button @click="identity = true" :style="selected2">管理</button>
      <form @submit.prevent="handlelogin">
        <span>
          <i class="fa-solid fa-user"></i>
          <input
            type="text"
            placeholder="用户名"
            id="username"
            v-model="username"
          />
        </span>
        <br />
        <span><i class="fa-solid fa-lock"></i></span>
        <input
          type="password"
          placeholder="密码"
          id="password"
          v-model="password"
        />
        <br />
        <button type="submit">登录</button>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const username = ref("");
const password = ref("");
const router = useRouter(); // 用于路由跳转
const token = ref("");
const identity = ref(true);
const selected1 = computed(() => {
  if (!identity.value) {
    return {
      "background-color": "#4caf50",
      color: "white",
    };
  } else {
    return {
      "background-color": "white",
      color: "black",
    };
  }
});
const selected2 = computed(() => {
  if (!identity.value) {
    return {
      "background-color": "white",
      color: "black",
    };
  } else {
    return {
      "background-color": "#4caf50",
      color: "white",
    };
  }
});
const path = computed(() =>
  identity.value ? "/api1/admin/index/login" : "/api2/index/login"
);
const handlelogin = async () => {
  try {
    // 请求后端
    const response = await axios.post(`${path.value}`, {
      userName: username.value,
      password: password.value,
    });

    // 处理响应状态码
    switch (response.data.code) {
      case 200: //把response的数据包括url全部打印出来
        console.log(response);
        alert("登录成功！");
        token.value = response.data.data.token;

        // 保存 token 到 localStorage
        if (identity.value) {
          localStorage.setItem("admintoken", token.value);
          localStorage.setItem("token", "");
          router.push("/admin");
        } else {
          localStorage.setItem("admintoken", "");
          localStorage.setItem("token", token.value);
          router.push("/emoji");
        }
        break;

      case 201:
        alert("用户名或密码错误，请检查后重试！");
        break;

      case 202:
        alert("验证码错误，请重新输入！");
        break;

      case 208:
        alert("用户未登录或未授权，请先登录！");
        break;

      default:
        alert("未知错误，请稍后再试！");
    }
  } catch (error) {
    alert(
      "url: " +
        error.config.url +
        "\n" +
        "data: " +
        error.config.data +
        "\n" +
        "response: " +
        error.response +
        "\n" +
        "message: " +
        error.message
    );
    console.log(error);
    // 处理请求错误
    if (error.response) {
      alert(`服务器错误，请稍后重试！ ${error.status}`);
    } else {
      alert("网络错误，请检查网络连接！");
    }
  }
};
</script>
<style scoped>
/* 两个按钮并列放在顶部的最右侧 */
.login {
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

.login-page {
  width: 380px;
  margin: 3% auto;
  border-radius: 25px;
  background-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 0 17px black;
}
.header {
  text-align: center;
  padding: 20px;
}
.header h1 {
  color: black;
  font-size: 40px;
  margin-bottom: 30px;
}
.main {
  text-align: center;
}
.main input {
  width: 300px;
  height: 40px;
  margin-bottom: 20px;
  padding: 0 10px;
  border: none;
  outline: none;
  border-radius: 20px;
  background-color: white;
  color: #333;
  padding-left: 40px;
  box-sizing: 15px;
}
.main input::placeholder {
  color: #333;
}
.main button {
  width: 80px;
  height: 50px;
  border: none;
  outline: none;
  border-radius: 10px;
  background-color: #763030;
  color: #fff;
  font-size: 20px;
  margin: 20px;
}
i {
  position: absolute;
  margin-left: 10px;
  margin-top: 10px;
  color: #333;
  padding-left: 10px;
}
/* 为button增加点击效果 */
button:active {
  transform: scale(0.98);
  box-shadow: 3px 2px 22px 1px rgba(0, 0, 0, 0.24);
}
/* 增加选中效果 */
</style>
