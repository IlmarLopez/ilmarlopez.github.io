import axios from "axios";
export default defineNuxtPlugin(async () => {

  let api = axios.create({
    baseURL: 'https://65354a23dbcf3a000719b57a--flourishing-valkyrie-ddb50c.netlify.app/',
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