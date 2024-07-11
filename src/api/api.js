import { Helper } from "../utils/helper.js";
import logger from "../utils/logger.js";

export class API {
  constructor(query) {
    this.url = "https://app.tabibot.com";
    this.host = "app.tabibot.com";
    this.ua = Helper.randomUserAgent();
    this.query = query;
  }

  generateHeaders() {
    const headers = {
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
      "Content-Type": "application/json",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "cors",
      Host: this.host,
      Origin: this.url,
      Referer: this.url + "/",
      "Sec-Fetch-Dest": "empty",
      rawdata: this.query,
    };

    // if (token) {
    //   headers.Authorization = token;
    // }

    return headers;
  }

  async fetch(endpoint, method, cred = "include", body = {}) {
    try {
      const url = `${this.url}${endpoint}`;
      const headers = this.generateHeaders();
      const options = {
        cache: "default",
        credentials: cred,
        headers,
        method,
        mode: "cors",
        redirect: "follow",
        referrer: this.url,
        referrerPolicy: "strict-origin-when-cross-origin",
      };
      logger.info(`${method} : ${url}`);
      logger.info(`Request Header : ${JSON.stringify(headers)}`);

      if (method !== "GET") {
        options.body = `${JSON.stringify(body)}`;
        logger.info(`Request Body : ${options.body}`);
      }

      const res = await fetch(url, options);

      logger.info(`Response : ${res.status} ${res.statusText}`);
      if (res.ok || res.status == 400) {
        const data = await res.json();
        logger.info(`Response Data : ${JSON.stringify(data)}`);
        return data;
      } else {
        throw new Error(`${res.status} - ${res.statusText}`);
      }
    } catch (err) {
      logger.error(`Error : ${err.message}`);
      throw err;
    }
  }
}
