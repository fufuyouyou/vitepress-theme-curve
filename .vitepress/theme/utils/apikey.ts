import request from "./request";
import CryptoJS from "crypto-js";

const apiKey = 'sk_eb37a07a44b844f8851c9dae7671af09';
const secretKey = 'ufh7ndwPAUmmlNOSzKQmzA2mVzznZlmAP6LhgS5s5no=';

function buildCanonicalQuery(params: Record<string, any> | undefined) {
  if (!params) return "";
  const keys = Object.keys(params).filter(k => params[k] !== undefined && params[k] !== null);
  keys.sort();
  return keys.map(k => `${k}=${params[k]}`).join("&");
}

function sha256Hex(body: any): string {
  if (body === undefined || body === null) return "";
  if (typeof body === "string") {
    return CryptoJS.SHA256(body).toString(CryptoJS.enc.Hex);
  }
  if (body instanceof FormData) {
    return "";
  }
  return CryptoJS.SHA256(JSON.stringify(body)).toString(CryptoJS.enc.Hex);
}

function hmacHex(text: string, secretKey: string): string {
  return CryptoJS.HmacSHA256(text, secretKey).toString(CryptoJS.enc.Hex);
}

export async function apiKeyRequest(options: {
  url: string;
  method?: "get" | "post" | "put" | "delete" | "patch";
  params?: Record<string, any>;
  data?: any;
}) {
  const { url, method = "get", params, data } = options;
  const ts = Math.floor(Date.now()).toString();
  const nonce = Math.random().toString(36).slice(2) + Date.now();
  const canonical = buildCanonicalQuery(params);
  const payload = `${method.toUpperCase()}\n${url}\n${canonical}\n${ts}\n${nonce}`;
  const signature = hmacHex(payload, secretKey);
  return request({
    url,
    method,
    params,
    data,
    headers: {
      isToken: false,
      "API-Key": apiKey,
      "Timestamp": ts,
      "Nonce": nonce,
      "Signature": signature,
    },
  });
}
