<template>
  <div class="register">
    <router-link to="/"><button>主页</button></router-link>
    <router-link to="/login"><button>登录</button></router-link>
  </div>
  <div class="login-page">
    <div class="header">
      <h1>注册</h1>
    </div>
    <div class="main">
      <button @click="identity = false" :style="selected1">用户</button>
      <button @click="identity = true" :style="selected2">管理</button>
      <form @submit.prevent="handleRegister">
        <span>
          <i class="fa-solid fa-user"></i>
          <input
            v-model="userName"
            type="text"
            placeholder="用户名"
            id="username"
          />
        </span>
        <br />
        <span><i class="fa-solid fa-phone"></i></span>
        <input
          v-model="phone"
          type="text"
          placeholder="电话(可选)"
          id="phone"
        />
        <br />
        <span><i class="fa-solid fa-envelope"></i></span>
        <input
          v-model="email"
          type="email"
          placeholder="邮箱(可选)"
          id="email"
        />
        <br />
        <span><i class="fa-solid fa-lock"></i></span>
        <input
          v-model="password"
          type="password"
          placeholder="密码"
          id="password"
        />
        <br />
        <button :disabled="isSubmitting" type="submit">
          {{ "注册" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const userName = ref("");
const phone = ref("");
const email = ref("");
const password = ref("");
const identity = ref(true); // 是否为管理员
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
const isSubmitting = ref(false); // 控制按钮状态
const router = useRouter(); // 路由实例
const path = computed(() =>
  identity.value ? "/api1/admin/index/register" : "/api2/index/register"
);
const handleRegister = async () => {
  // 前端表单验证
  if (!userName.value || userName.value.length < 3) {
    alert("用户名至少需要3个字符！");
    return;
  }
  if (!password.value || password.value.length < 6) {
    alert("密码至少需要6个字符！");
    return;
  }
  if (email.value && !/^\S+@\S+\.\S+$/.test(email.value)) {
    alert("请输入有效的邮箱地址！");
    return;
  }
  if (phone.value && !/^\d+$/.test(phone.value)) {
    alert("电话号码只能包含数字！");
    return;
  }

  isSubmitting.value = true; // 禁用按钮
  try {
    const response = await axios.post(`${path.value}`, {
      userName: userName.value,
      phone: phone.value,
      email: email.value,
      password: password.value,
    });
    switch (response.data.code) {
      case 200:
        alert("注册成功！");
        router.push("/login"); // 跳转到登录页面
        break;

      case 209:
        alert("用户名已存在，请尝试其他用户名！");
        break;

      case 9999:
        alert("系统错误，请稍后再试！");
        break;

      default:
        alert("未知错误，请联系管理员！");
    }
  } catch (error) {
    alert(`网络错误或后端未响应，请稍后重试！${error}`);
  } finally {
    isSubmitting.value = false; // 恢复按钮状态
  }
};
</script>
<style scoped>
/* 两个按钮并列放在顶部的最右侧 */
.register {
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
