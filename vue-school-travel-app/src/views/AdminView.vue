<template>
  <!-- 只有在有 token 的情况下显示用户管理和表情查询功能 -->
  <template v-if="hastoken || 1">
    <div class="user-management">
      <div class="menu">
        <button
          :class="{ active: activeTab === 'info' }"
          @click="switchTab('info')"
        >
          查询用户信息
        </button>
        <button
          :class="{ active: activeTab === 'list' }"
          @click="switchTab('list')"
        >
          分页查询用户列表
        </button>
        <button
          :class="{ active: activeTab === 'emojiCount' }"
          @click="switchTab('emojiCount')"
        >
          查询表情数量
        </button>
        <button
          :class="{ active: activeTab === 'emojiHourly' }"
          @click="switchTab('emojiHourly')"
        >
          表情变化查询
        </button>
        <button @click="exportEmojiData" class="export-btn">
          导出表情数据
        </button>
      </div>

      <!-- 用户信息查询 -->
      <div v-if="activeTab === 'info'" class="tab-content">
        <h2>用户信息</h2>
        <button @click="fetchUserInfo">获取用户信息</button>
        <div v-if="userInfo" class="info">
          <p><strong>ID:</strong> {{ userInfo.id }}</p>
          <p><strong>用户名:</strong> {{ userInfo.userName }}</p>
          <p><strong>邮箱:</strong> {{ userInfo.email }}</p>
          <p><strong>电话:</strong> {{ userInfo.phone }}</p>
          <p><strong>创建时间:</strong> {{ userInfo.createTime }}</p>
        </div>
      </div>

      <!-- 分页用户列表 -->
      <div v-if="activeTab === 'list'" class="tab-content">
        <h2>分页用户列表</h2>
        <div class="filters">
          <div>
            <label>页数：</label>
            <input
              v-model.number="pagination.pageNum"
              type="number"
              min="1"
              placeholder="请输入页码"
            />
          </div>
          <div>
            <label>每页个数：</label>
            <input
              v-model.number="pagination.pageSize"
              type="number"
              min="1"
              placeholder="请输入每页个数"
            />
          </div>
          <div>
            <label>关键字：</label>
            <input
              v-model="filters.keyword"
              type="text"
              placeholder="请输入关键字"
            />
          </div>
          <div>
            <label>起始时间：</label>
            <input v-model="filters.createTimeBegin" type="date" />
          </div>
          <div>
            <label>结束时间：</label>
            <input v-model="filters.createTimeEnd" type="date" />
          </div>
          <button @click="fetchUserList">查询</button>
        </div>
        <div v-if="userList && userList.length">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>用户名</th>
                <th>邮箱</th>
                <th>电话</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in userList" :key="user.id">
                <td class="id">{{ user.id }}</td>
                <td class="name">{{ user.userName }}</td>
                <td class="email">{{ user.email }}</td>
                <td class="phone">{{ user.phone }}</td>
                <td class="time">{{ user.createTime }}</td>
              </tr>
            </tbody>
          </table>
          <p>总记录数: {{ pagination.total }}</p>
          <div class="pagination">
            <!-- <button
              :disabled="pagination.pageNum === 1"
              @click="changePage(pagination.pageNum - 1)"
            >
              上一页
            </button>
            <button
              :disabled="
                pagination.pageNum * pagination.pageSize >= pagination.total &&
                pagination.total > 0
              "
              @click="changePage(pagination.pageNum + 1)"
            >
              下一页
            </button> -->
          </div>
        </div>
      </div>

      <!-- 查询表情数量 -->
      <div v-if="activeTab === 'emojiCount'" class="tab-content">
        <h2>查询表情数量</h2>
        <div class="filters">
          <div>
            <label>起始时间：</label>
            <input v-model="emojiFilters.startTime" type="date" />
          </div>
          <div>
            <label>结束时间：</label>
            <input v-model="emojiFilters.endTime" type="date" />
          </div>
          <button @click="fetchEmojiCount">查询</button>
        </div>
        <div v-if="emojiCount">
          <table>
            <thead>
              <tr>
                <th>表情</th>
                <th>出现次数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(count, emoji) in emojiCount" :key="emoji">
                <td>{{ emoji }}</td>
                <td>{{ count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 表情变化查询 -->
      <div v-if="activeTab === 'emojiHourly'" class="tab-content">
        <h2>表情变化查询</h2>
        <div class="filters">
          <div>
            <label>起始时间：</label>
            <input v-model="emojiHourlyFilters.startTime" type="date" />
          </div>
          <button @click="fetchEmojiHourly">查询</button>
        </div>
        <div v-if="emojiHourlyData">
          <table>
            <thead>
              <tr>
                <th>时间</th>
                <th>表情</th>
                <th>出现次数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(hourlyData, index) in emojiHourlyData" :key="index">
                <td>{{ hourlyData.timestamp }}</td>
                <td>{{ hourlyData.emoji_code1 }}</td>
                <td>{{ hourlyData.emoji_code1_count }}</td>
                <td>{{ hourlyData[0] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  <template v-else>
    <HomeHeader></HomeHeader>
    <div class="stress">请先注册或登录再使用相关功能</div>
  </template>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import HomeHeader from "../components/HomeHeader.vue";

// 当前激活的选项卡
const activeTab = ref("info");
const hastoken = ref("");
hastoken.value = !!localStorage.getItem("admintoken");

// 用户信息
const userInfo = ref(null);

// 分页用户列表
const userList = ref([]);
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});
const filters = ref({
  keyword: "",
  createTimeBegin: "",
  createTimeEnd: "",
});

// 表情数量查询
const emojiCount = ref(null);
const emojiFilters = ref({
  startTime: "",
  endTime: "",
});

// 表情变化查询
const emojiHourlyData = ref([]);
const emojiHourlyFilters = ref({
  startTime: "",
});

// 切换选项卡
const switchTab = (tab) => {
  activeTab.value = tab;
};

// 获取当前用户信息
const fetchUserInfo = async () => {
  alert(`${localStorage.getItem("admintoken")}`);
  try {
    const token = localStorage.getItem("admintoken");
    const response = await axios.get("/api1/admin/user/info/get", {
      headers: {
        // Authorization: `Bearer ${token}`,
        token: `${token}`,
      },
    });
    if (response.data.code === 200) {
      userInfo.value = response.data.data;
    } else {
      alert(response.data.message || "获取用户信息失败");
    }
  } catch (error) {
    alert("请求失败，请稍后重试");
  }
};

// 分页查询用户列表
const fetchUserList = async () => {
  try {
    const token = localStorage.getItem("admintoken");
    const { pageNum, pageSize } = pagination.value;
    const { keyword, createTimeBegin, createTimeEnd } = filters.value;
    const response = await axios.get(
      `/api1/admin/user/findByPage/${pageNum}/${pageSize}`,
      {
        headers: {
          token: `${token}`,
        },
        params: { keyword, createTimeBegin, createTimeEnd },
      }
    );
    if (response.data.code === 200) {
      alert(`${response.data.data}`);
      console.log(response.data.data);
      userList.value = response.data.data;
      pagination.value.total = response.data.data.length;
    } else {
      alert(response.data.message || "查询用户列表失败");
    }
  } catch (error) {
    alert("请求失败，请稍后重试");
  }
};

// 获取表情数量
const fetchEmojiCount = async () => {
  try {
    const token = localStorage.getItem("admintoken");
    const { startTime, endTime } = emojiFilters.value;
    let response = null;
    if (startTime === "" && endTime === "") {
      response = await axios.get("/api1/admin/emoji/count", {
        headers: {
          token: `${token}`,
        },
      });
    } else if (startTime && endTime) {
      response = await axios.get("/api1/admin/emoji/count", {
        headers: {
          token: `${token}`,
        },
        params: { startTime, endTime },
      });
    } else if (startTime && endTime === "") {
      response = await axios.get("/api1/admin/emoji/count", {
        headers: {
          token: `${token}`,
        },
        params: { startTime },
      });
    } else {
      response = await axios.get("/api1/admin/emoji/count", {
        headers: {
          token: `${token}`,
        },
        params: { endTime },
      });
    }
    if (response.data.code === 200) {
      emojiCount.value = response.data.data;
    } else {
      alert(response.data.message || "查询表情数量失败");
    }
  } catch (error) {
    alert("请求失败，请稍后重试");
  }
};

// 获取表情变化数据
const fetchEmojiHourly = async () => {
  try {
    const token = localStorage.getItem("admintoken");
    const { startTime } = emojiHourlyFilters.value;
    let response = "";
    if (startTime !== "") {
      response = await axios.get("/api1/admin/emoji/hourly", {
        headers: {
          token: `${token}`,
        },
        params: { startTime },
      });
    } else {
      response = await axios.get("/api1/admin/emoji/hourly", {
        headers: {
          token: `${token}`,
        },
      });
    }
    if (response.data.code === 200) {
      emojiHourlyData.value = response.data.data;
      alert("数据读到了");
      console.log(response);
      console.log(response.data);
      console.log(response.data.data);
    } else {
      alert(response.data.message || "查询表情变化失败");
    }
  } catch (error) {
    alert("请求失败，请稍后重试");
  }
};

// 导出表情数据
const exportEmojiData = async () => {
  try {
    const token = localStorage.getItem("admintoken");
    const response = await axios.get("/api1/admin/emoji/export", {
      headers: {
        token: `${token}`,
      },
      responseType: "blob", // 设置响应类型为 blob 用于下载文件
    });
    if (response.status === 200) {
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // 更准确的 Excel MIME 类型
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "表情数据.xlsx"; // 文件名
      link.click();
    } else {
      alert("导出失败");
    }
  } catch (error) {
    alert("导出表情数据时出错，请稍后重试");
  }
};

// 改变页码
// 改变页码
// const changePage = (newPage) => {
//   if (Number(newPage) < 1) {
//     newPage = 1; // 防止页码小于1
//   }
//   const totalPages = Math.ceil(
//     pagination.value.total / pagination.value.pageSize
//   );
//   if (Number(newPage) > totalPages) {
//     newPage = totalPages; // 防止页码大于最大页数
//   }
//   pagination.value.pageNum = Number(newPage); // 更新页码
//   fetchUserList(); // 重新查询用户列表
// };
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
.user-management {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}
.menu {
  margin-bottom: 20px;
}
.menu button {
  padding: 10px 20px;
  margin-right: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.menu button.active {
  background-color: #2e7d32;
}
.menu button:hover {
  background-color: #45a049;
}
.tab-content {
  text-align: center;
  margin-top: 20px;
  /* 白色 */
  padding: 20px;
  border-radius: 5px;
}

.tab-content h2 {
  font-size: 24px;
  margin-bottom: 20px;
}

.tab-content button {
  display: inline-block;
  margin-top: 10px;
  padding: 10px 20px;
  margin-right: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.tab-content p {
  display: inline-block;
  margin-top: 10px;
  padding: 10px 20px;
  margin-right: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.filters {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}
.filters div {
  display: flex;
  align-items: center;
}
.filters label {
  margin-right: 10px;
}
.filters input {
  padding: 5px;
  flex-grow: 1;
}
.pagination {
  margin-top: 10px;
}
.pagination button {
  margin-right: 10px;
  padding: 5px 10px;
  padding: 10px 20px;
  margin-right: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
table th,
table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
table th {
  background-color: #f4f4f4;
}
table td {
  color: #2e7d32;
  background: #ddd;
}
.filters label {
  color: white;
  font-weight: bold;
  margin-right: 10px;
}
.export-btn {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  margin-left: 10px;
}
.export-btn:hover {
  background-color: #0056b3;
}
.id {
  width: 30px;
  background-color: #ddd;
}
.name {
  width: 150px;
  background-color: #ddd;
}
.email {
  width: 250px;
  background-color: #ddd;
}
.phone {
  width: 150px;
  background-color: #ddd;
}
.time {
  width: 300px;
  background-color: #ddd;
}
</style>
