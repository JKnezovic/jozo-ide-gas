import axios from "axios";
import Constants from "expo-constants";

// Injected at build time from the JOZO_API_KEY environment variable - see app.config.js.
const apiKey = Constants.expoConfig?.extra?.apiKey ?? "";

if (!apiKey) {
  console.warn("No API key in this build - uploads, deletes and location updates will be rejected.");
}

// Override with JOZO_API_BASE_URL at build time to point a build at a local server.
const baseURL = Constants.expoConfig?.extra?.apiBaseUrl;

export default axios.create({
  baseURL,
  headers: { "X-Api-Key": apiKey },
});
