import { API } from "../api/api.js";

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
      await this.fetch("/api/user/sign-in", "POST", "omit")
        .then((data) => {
          this.user = data.user;
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
      await this.fetch("/api/mining/info", "GET", "omit")
        .then((data) => {
          this.mining = data;
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
      await this.fetch("/api/reward-pool/info", "GET", "omit")
        .then((data) => {
          this.pool = data;
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
      await this.fetch("/api/reward-pool/info", "GET", "omit")
        .then((data) => {
          this.pool = data;
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
      await this.fetch("/api/user/check-in", "POST", "omit")
        .then((data) => {
          this.user = data;
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
      await this.fetch("/api/user/level-up", "POST", "omit")
        .then(async (data) => {
          this.user = data;
          await this.getUserMining().then(resolve);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
