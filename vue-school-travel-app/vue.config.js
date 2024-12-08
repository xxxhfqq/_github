const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      // 如果请求路径包含 /api1，则代理到 8080 端口
      "/api1": {
        target: "http://59.110.93.150:8080", // 目标后端接口地址 8080 端口
        changeOrigin: true, // 修改请求头中的 Origin 字段
        pathRewrite: {
          "^/api1": "", // 去掉请求路径中的 /api1 前缀，转发到目标后端
        },
      },
      // 如果请求路径包含 /api2，则代理到 8081 端口
      "/api2": {
        target: "http://59.110.93.150:8081", // 目标后端接口地址 8081 端口
        changeOrigin: true, // 修改请求头中的 Origin 字段
        pathRewrite: {
          "^/api2": "", // 去掉请求路径中的 /api2 前缀，转发到目标后端
        },
      },
      // 如果有其他的代理需求，可以继续添加
    },
  },
});
