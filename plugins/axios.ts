import axios from "axios";
export default defineNuxtPlugin(async () => {

  let api = axios.create({
    baseURL: 'https://api.ilmarlopez.com/',
    timeout: 1000,
    headers: {
      common: {},
    },
  });
return {
    provide: {
      api: api,
    },
  };
});