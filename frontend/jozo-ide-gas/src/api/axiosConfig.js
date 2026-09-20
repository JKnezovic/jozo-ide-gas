import axios from "axios";

// Set per build target in .env.development / .env.production.
const baseURL = process.env.REACT_APP_API_BASE_URL;

if (!baseURL) {
  console.warn("REACT_APP_API_BASE_URL is not set - API calls will go to the page's own origin.");
}

export default axios.create({
  baseURL,
});
