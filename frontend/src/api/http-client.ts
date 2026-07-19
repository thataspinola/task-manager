import axios from "axios";

const baseURL = import.meta.env.VITE_BFF_BASE_URL;

if (!baseURL) {
  throw new Error("VITE_BFF_BASE_URL is not defined");
}

export const httpClient = axios.create({
  baseURL,
  timeout: 10_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
