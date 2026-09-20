// Layers the build-time API key onto the static config in app.json. The key comes from
// the environment (an EAS secret for cloud builds) so it never lands in the repo.
export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    apiKey: process.env.JOZO_API_KEY ?? "",
    apiBaseUrl: process.env.JOZO_API_BASE_URL ?? "https://ec2.jozoidegas.ovh:8443/",
  },
});
