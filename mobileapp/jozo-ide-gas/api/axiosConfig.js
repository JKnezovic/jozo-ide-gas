import axios from "axios";
import Constants from "expo-constants";

// Injected at build time from the JOZO_API_KEY environment variable - see app.config.js.
const apiKey = Constants.expoConfig?.extra?.apiKey ?? "";

if (!apiKey) {
  console.warn("No API key in this build - uploads, deletes and location updates will be rejected.");
}

export default axios.create({
  baseURL: "https://ec2.jozoidegas.ovh:8443/",
  headers: { "X-Api-Key": apiKey },
});
