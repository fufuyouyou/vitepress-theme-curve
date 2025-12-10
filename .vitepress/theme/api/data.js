import { apiKeyRequest } from "../utils/apikey.ts";

export const listNav = () => {
  return apiKeyRequest({
    url: "/blog/api/listNav",
    method: "get",
  });
};

export const listType = () => {
  return apiKeyRequest({
    url: "/blog/api/listType",
    method: "get",
  });
};

export const listLabel = () => {
  return apiKeyRequest({
    url: "/blog/api/listLabel",
    method: "get",
  });
};

export const pageArticle = (page, data) => {
  return apiKeyRequest({
    url: "/blog/api/pageArticle",
    method: "post",
    params: page,
    data
  });
};

export const getArticle = (id) => {
  return apiKeyRequest({
    url: "/blog/api/getArticle",
    method: "get",
    params: {
      id,
    },
  });
};

export const countByYear = () => {
  return apiKeyRequest({
    url: "/blog/api/countByYear",
    method: "get",
  });
};
