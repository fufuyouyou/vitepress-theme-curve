import request from "../utils/request";

export const listNav = () => {
  return request({
    url: "/blog/api/listNav",
    method: "get",
  });
};

export const listType = () => {
  return request({
    url: "/blog/api/listType",
    method: "get",
  });
};

export const listLabel = () => {
  return request({
    url: "/blog/api/listLabel",
    method: "get",
  });
};

export const pageArticle = (page, data) => {
  return request({
    url: "/blog/api/pageArticle",
    method: "post",
    params: page,
    data
  });
};

export const getContent = (id) => {
  return request({
    url: "/blog/api/getContent",
    method: "get",
    params: {
      id,
    },
  });
};

export const countByYear = () => {
  return request({
    url: "/blog/api/countByYear",
    method: "get",
  });
};
