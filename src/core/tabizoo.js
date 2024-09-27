import { API } from "../api/api.js";
import logger from "../utils/logger.js";

export class Tabizoo extends API {
  constructor(account, query, queryObj) {
    super(query);
    this.account = account;
    this.query = query;
    this.queryObj = queryObj;
  }

  async login() {
    // console.log(this.query);
    return new Promise(async (resolve, reject) => {
      await this.fetch("/api/user/sign-in", "POST")
        .then((data) => {
          this.user = data.user;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async getUserProfile() {
    // console.log(this.query);
    return new Promise(async (resolve, reject) => {
      await this.fetch("/api/user/v1/profile", "GET")
        .then((data) => {
          this.user = data.data.user;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async getUserMining() {
    // console.log(this.query);
    return new Promise(async (resolve, reject) => {
      await this.fetch("/api/mining/v1/info", "GET")
        .then((data) => {
          this.mining = data.data.mining_data;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async getUserReward() {
    // console.log(this.query);
    return new Promise(async (resolve, reject) => {
      await this.fetch("/api/reward-pool/info", "GET")
        .then((data) => {
          this.pool = data;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async getTask() {
    // console.log(this.query);
    return new Promise(async (resolve, reject) => {
      await this.fetch("/api/task/v1/list", "GET")
        .then((data) => {
          this.task = [];
          data.data.map((item) => {
            this.task.push(...item.task_list);
          });
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async checkIn() {
    // console.log(this.query);
    return new Promise(async (resolve, reject) => {
      await this.fetch("/api/user/v1/check-in", "POST")
        .then((data) => {
          this.user = data.data.user;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async levelUp() {
    // console.log(this.query);
    return new Promise(async (resolve, reject) => {
      await this.fetch("/api/user/level-up", "POST")
        .then(async (data) => {
          this.user = data;
          await this.getUserMining().then(resolve);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async claimMining() {
    // console.log(this.query);
    return new Promise(async (resolve, reject) => {
      await this.fetch("/api/mining/v1/claim", "POST")
        .then(async (data) => {
          await this.getUserMining().then(resolve);
          await this.getUserProfile().then(resolve);
          return data;
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async getSpinInfo() {
    // console.log(this.query);
    return new Promise(async (resolve, reject) => {
      await this.fetch("/api/spin/v1/info", "POST")
        .then(async (data) => {
          this.spin = data.data;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async playSpin() {
    // console.log(this.query);
    return new Promise(async (resolve, reject) => {
      const body = { multiplier: 2 };
      await this.fetch("/api/spin/v1/play", "POST", body)
        .then(async (data) => {
          this.spin = data.data;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
