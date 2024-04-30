import axios from "axios";

export default axios.create({
  baseURL: "https://ec2.jozoidegas.ovh:8443/",
});

/* export default axios.create({
  baseURL: "http://192.168.0.13:8080",
}); */
