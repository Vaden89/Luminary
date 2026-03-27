export const CONFIG = {
  BACKEND_URL: "https://luminary-2lvb.onrender.com/api",
};

export const CONFIG_DEV = {
  BACKEND_URL: "http://127.0.0.1:5000/api",
};

// The current default is the backend hosted on render. You can flip to CONFIG_DEV if you want to work with the dev API.
export const ACTIVE_CONFIG = CONFIG;

// You can use this import statement in any js file for use like so:
// import { ACTIVE_CONFIG as CONFIG } from "../config.js";
// You can then use the variable like so:
// const endpoint = `${CONFIG.BACKEND_URL}/nomination`;
