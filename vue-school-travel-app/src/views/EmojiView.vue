<template>
  <div>
    <!-- 右上角菜单按钮 -->
    <div class="menu-button" @click="toggleMenu" v-if="hastoken">☰</div>

    <!-- 弹出菜单 -->
    <div v-if="isMenuVisible" class="menu-dropdown">
      <button @click="fetchUserInfo">查看用户信息</button>
      <button @click="goToPasswordChangePage">修改密码</button>
      <button @click="fetchEmojiHistory">查看表情历史</button>
    </div>

    <!-- 中间表情选择界面 -->
    <template v-if="hastoken && isEmojiPageVisible">
      <div class="body">
        <div class="emoji-container">
          <h2>你现在的心情如何？</h2>
          <div class="emoji-group">
            <div
              class="emoji"
              :class="{ selected: selectedEmoji === 'confused' }"
              @click="selectEmoji('confused')"
            >
              😕
            </div>
            <div
              class="emoji"
              :class="{ selected: selectedEmoji === 'angry' }"
              @click="selectEmoji('angry')"
            >
              😡
            </div>
            <div
              class="emoji"
              :class="{ selected: selectedEmoji === 'laughing' }"
              @click="selectEmoji('laughing')"
            >
              😆
            </div>
            <div
              class="emoji"
              :class="{ selected: selectedEmoji === 'sleepy' }"
              @click="selectEmoji('sleepy')"
            >
              😴
            </div>
            <div
              class="emoji"
              :class="{ selected: selectedEmoji === 'worried' }"
              @click="selectEmoji('worried')"
            >
              😨
            </div>
            <div
              class="emoji"
              :class="{ selected: selectedEmoji === 'smiling' }"
              @click="selectEmoji('smiling')"
            >
              🙂
            </div>
            <div
              class="emoji"
              :class="{ selected: selectedEmoji === 'disappointed' }"
              @click="selectEmoji('disappointed')"
            >
              😞
            </div>
            <div
              class="emoji"
              :class="{ selected: selectedEmoji === 'smirking' }"
              @click="selectEmoji('smirking')"
            >
              😏
            </div>
          </div>

          <!-- 隐藏字段，用来存储选中的表情 -->
          <input
            type="hidden"
            id="selectedEmoji"
            name="emoji"
            :value="selectedEmoji"
          />

          <!-- 提交按钮 -->
          <button
            type="button"
            class="submit-btn"
            :disabled="!selectedEmoji"
            @click="submitEmoji"
          >
            确认提交
          </button>
        </div>
      </div>
    </template>

    <!-- 如果没有 token，显示提示信息 -->
    <template v-if="!hastoken">
      <HomeHeader />
      <div class="stress">请先注册或登录再使用相关功能</div>
    </template>

    <!-- 密码修改页面 -->
    <template v-if="isPasswordChangePageVisible">
      <div class="password-change-overlay">
        <div class="password-change-container">
          <div>
            <i
              class="fa-solid fa-xmark fa-2x"
              @click="
                (isPasswordChangePageVisible = false),
                  (isEmojiPageVisible = true)
              "
              style="display: block; text-align: right"
            ></i>
          </div>
          <h2>修改密码</h2>
          <form @submit.prevent="changePassword">
            <div class="input-group">
              <label for="oldPassword">旧密码</label>
              <input
                type="password"
                id="oldPassword"
                v-model="oldPassword"
                required
              />
            </div>
            <div class="input-group">
              <label for="newPassword">新密码</label>
              <input
                type="password"
                id="newPassword"
                v-model="newPassword"
                required
              />
            </div>
            <div class="input-group">
              <label for="confirmPassword">确认新密码</label>
              <input
                type="password"
                id="confirmPassword"
                v-model="confirmPassword"
                required
              />
            </div>
            <button type="submit" class="submit-btn">提交</button>
          </form>
        </div>
      </div>
    </template>
    <!-- 查看用户信息 -->
    <template v-if="userinfovisible">
      <div class="user-info-box">
        <div class="content">
          <i
            class="fa-solid fa-xmark fa-2x closebtn"
            @click="(userinfovisible = false), (isEmojiPageVisible = true)"
          ></i>
          <h3>用户信息</h3>
          <ul>
            <li><strong>用户名：</strong>{{ userinfo.userName }}</li>
            <li><strong>邮箱：</strong>{{ userinfo.email }}</li>
            <li><strong>手机号：</strong>{{ userinfo.phone }}</li>
            <li><strong>创建时间：</strong>{{ userinfo.createTime }}</li>
          </ul>
        </div>
      </div>
    </template>
    <!-- 用户表情历史 -->
    <template v-if="emojihistoryvisible">
      <div class="emojihistorybox">
        <div class="content">
          <i
            class="fa-solid fa-xmark fa-2x closebtn"
            @click="(emojihistoryvisible = false), (isEmojiPageVisible = true)"
          ></i>
          <h3>历史表情</h3>
          <ul>
            <li v-for="emoji in emojihistory" :key="emoji.id">
              <span style="width: 200px; text-align: left" id="al">
                <strong>表情：</strong>{{ emoji.emojiCode }}
              </span>
              <span style="width: 400px; text-align: left" id="al">
                <strong>时间：</strong>{{ emoji.timestamp }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import HomeHeader from "../components/HomeHeader.vue";

// 定义响应式变量
const hastoken = ref(!!localStorage.getItem("token"));
const isMenuVisible = ref(false);
const isEmojiPageVisible = ref(true); // 默认显示表情选择页面
const isPasswordChangePageVisible = ref(false); // 默认不显示密码修改页面
const selectedEmoji = ref("");
const oldPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

// 控制菜单的显示与隐藏
const toggleMenu = () => {
  isMenuVisible.value = !isMenuVisible.value;
};

// 选择表情的函数
function selectEmoji(emoji) {
  selectedEmoji.value = emoji; // 设置选中的表情
}

// 提交表情的函数
const submitEmoji = async () => {
  if (!selectedEmoji.value) return;

  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      "/api2/emoji/post",
      { emojiCode: selectedEmoji.value },
      {
        headers: {
          token: `${token}`,
        },
      }
    );
    if (response.data.code === 200) {
      alert("表情发送成功");
    } else {
      alert("表情发送失败");
    }
  } catch (error) {
    alert("请求失败，请稍后重试");
  }
};

// 查看用户信息
const userinfo = ref("");
const userinfovisible = ref(false);
const fetchUserInfo = async () => {
  toggleMenu();
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get("/api2/user/info/get", {
      headers: {
        token: `${token}`,
      },
    });
    if (response.data.code === 200) {
      userinfo.value = response.data.data;

      userinfovisible.value = true;
      isEmojiPageVisible.value = false; // 隐藏表情选择页面
    } else {
      alert("获取用户信息失败");
    }
  } catch (error) {
    alert("请求失败，请稍后重试");
  }
};
const emojihistory = ref("");
const emojihistoryvisible = ref(false);
// 查看表情历史
const fetchEmojiHistory = async () => {
  toggleMenu();
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get("/api2/emoji/findByPage/1/20", {
      headers: {
        token: `${token}`,
      },
    });
    if (response.data.code === 200) {
      emojihistory.value = response.data.data;
      emojihistoryvisible.value = true;
      isEmojiPageVisible.value = false; // 隐藏表情选择页面
      console.log("表情历史：", response.data.data);
    } else {
      alert("获取表情历史失败");
    }
  } catch (error) {
    alert("请求失败，请稍后重试");
  }
};

// 跳转到密码修改页面
const goToPasswordChangePage = () => {
  toggleMenu();
  isPasswordChangePageVisible.value = true;
  isEmojiPageVisible.value = false; // 隐藏表情选择页面
};

// 修改密码
const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    alert("新密码和确认密码不一致");
    return;
  }

  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      "/api2/user/change-password",
      {
        oldPassword: oldPassword.value,
        newPassword: newPassword.value,
      },
      {
        headers: {
          token: `${token}`,
        },
      }
    );

    if (response.data.code === 200) {
      alert("密码修改成功");
      isPasswordChangePageVisible.value = false; // 修改成功后返回
      isEmojiPageVisible.value = true;
    } else {
      alert("密码修改失败");
    }
  } catch (error) {
    alert("请求失败，请稍后重试");
  }
};
</script>

<style scoped>
.stress {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  color: red;
}

.menu-button {
  position: fixed;
  top: 20px;
  right: 20px;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
}

.menu-dropdown {
  position: fixed;
  top: 60px;
  right: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  padding: 10px;
  z-index: 9;
}

.menu-dropdown button {
  display: block;
  width: 200px;
  padding: 10px;
  margin: 5px 0;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.menu-dropdown button:hover {
  background-color: #45a049;
}

.body {
  font-family: Arial, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.emoji-container {
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  width: 80%;
  max-width: 600px;
  border-radius: 25px;
  background-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 0 17px black;
}

.emoji-group {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 每行4个表情 */
  gap: 20px;
  margin-bottom: 20px;
}

.emoji {
  font-size: 3rem;
  cursor: pointer;
  padding: 15px;
  border-radius: 50%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background-color: #fff;
  border: 2px solid transparent;
}

.emoji:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.emoji.selected {
  border: 2px solid #4caf50;
  background-color: #e8f5e9;
}

.submit-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 15px 32px;
  font-size: 18px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  width: 100%;
}

.submit-btn:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.submit-btn:hover:enabled {
  background-color: #45a049;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.password-change-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1); /* 半透明背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
}

.password-change-container {
  padding: 30px;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 0 17px black;
  width: 400px;
}
.user-info-box {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3); /* 深色半透明背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
  padding: 20px;
}

.user-info-box > .content {
  background-color: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  width: 80%;
  max-width: 600px;
  position: relative;
}

.closebtn {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: #888;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #4caf50;
}

.user-info-box h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
  position: relative;
  top: 10px;
}

.user-info-box ul {
  list-style-type: none;
  padding: 0;
  margin-top: 20px;
}

.user-info-box li {
  font-size: 16px;
  margin-bottom: 10px;
  line-height: 1.8;
}

.user-info-box strong {
  color: #4caf50;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
}

.input-group input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.submit-btn {
  width: 100%;
  margin-top: 10px;
}
.emojihistorybox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3); /* 深色半透明背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
  padding: 20px;
  overflow: hidden; /* 隐藏溢出的内容 */
}

.emojihistorybox > .content {
  background-color: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  width: 80%;
  max-width: 600px;
  max-height: 80%; /* 限制最大高度，避免过高的弹窗 */
  overflow-y: auto; /* 允许纵向滚动 */
  position: relative;
}

.closebtn {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: #888;
  transition: color 0.3s ease;
}

.closebtn:hover {
  color: #4caf50;
}

.emojihistorybox h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
  position: relative;
  top: 10px;
}

.emojihistorybox ul {
  list-style-type: none;
  padding: 0;
  margin-top: 20px;
}

.emojihistorybox li {
  font-size: 16px;
  margin-bottom: 10px;
  line-height: 1.8;
}

.emojihistorybox strong {
  color: #4caf50;
}
#al {
  display: inline-block;
  width: 400px;
  text-align: left;
  margin-right: right;
}
</style>
