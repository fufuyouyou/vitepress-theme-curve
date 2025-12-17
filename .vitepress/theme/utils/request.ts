import axios from "axios";

const errorHandler = (error: any) => {
  console.log("error", error);
  let errorCode = error.code;
  if (errorCode == "ERR_NETWORK") {
    console.error('网络链接错误');
    return Promise.reject(error);
  }
  let status = error.response.status;
  if (error.response) {
    const { message } = error.response.data;
    if (status === 403) {
      console.error(message || "未授权");
    } else if (status === 404) {
      console.error("请求的页面（资源）不存在" + error.request.responseURL);
    } else if (status === 401) {
      console.error(message || "未授权");
    } else if (status === 500) {
      console.error(message || "服务错误");
    }
    return Promise.reject(error);
  }
};

const request = axios.create({
  // baseURL: 'https://manage.suzhibin.cn/manage-api',
  baseURL: 'http://127.0.0.1:8080/manage-api',
  timeout: 10000, // 超时时间，10s
  withCredentials: true,
  validateStatus(status) {
    return status >= 200 && status < 300;
  },
});
request.interceptors.request.use(config => {
      return config;
    },
    (error) => {
      return errorHandler(error);
    },
);
// add response interceptors
request.interceptors.response.use((response) => {
      if (response.config.responseType === "blob") {
        return response;
      } else {
        return Object.assign({ success: false }, response.data);
      }
    },
    (error) => {
      return errorHandler(error);
    },
);

export default request;
