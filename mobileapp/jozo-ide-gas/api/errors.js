// The API answers bad requests with a plain-text reason, which is far more useful to show
// than a generic failure message.
export const describeError = (error, fallback) => {
  const body = error?.response?.data;
  if (typeof body === "string" && body.trim()) {
    return body.trim();
  }
  if (error?.response?.status === 401) {
    return "This build is not sending a valid API key.";
  }
  return fallback;
};
