// src/api/index.js
import axios from "axios";

// Create an axios instance for your backend
const API = axios.create({
  baseURL: "http://localhost:5000/api/auth", // make sure port is 5000
  withCredentials: true, // if using cookies
});

export default API;
