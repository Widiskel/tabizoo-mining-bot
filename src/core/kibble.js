import { API } from "../api/api.js";
import logger from "../utils/logger.js";

export class Kibble extends API {
  constructor(account) {
    super();
    this.account = account;
  }

  async login() {
    return new Promise(async (resolve, reject) => {
      await this.fetch("/auth/connect-telegram", "POST", undefined, {
        telegram_id: this.account.id,
        telegram_name: this.account.firstName + " " + this.account.lastName,
        referral_code: "",
      })
        .then((data) => {
          this.token = data.token;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async getStatistic() {
    return new Promise(async (resolve) => {
      await this.fetch("/users/statistic", "GET", this.token)
        .then((data) => {
          this.statistic = data;
          resolve();
        })
        .catch(async (err) => {
          logger.error(JSON.stringify(err));
          console.log(err.message);
          await this.getTask().then(resolve);
        });
    });
  }
  async getTask() {
    return new Promise(async (resolve) => {
      await this.fetch("/tasks/list", "GET", this.token)
        .then((data) => {
          /** @type {any[]} */
          const task = data.userTasks;
          this.uncompletedTaskList = task.filter((item) => {
            if (item.status == "OPEN") return item;
          });
          resolve();
        })
        .catch(async (err) => {
          logger.error(JSON.stringify(err));
          console.log(err.message);
          await this.getTask().then(resolve);
        });
    });
  }
  async missionQuest(task) {
    return new Promise(async (resolve, reject) => {
      await this.fetch("/tasks/mission-quest", "POST", this.token, {
        task_type: task.task.task_type,
      })
        .then(async (data) => {
          console.log(`-> Task ${task.task.name} COMPLETED`);
          console.log(`-> Update task list and statistic`);
          await this.getTask();
          await this.getStatistic();
          console.log();
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
