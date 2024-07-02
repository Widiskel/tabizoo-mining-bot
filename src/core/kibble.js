import { API } from "../api/api.js";
import logger from "../utils/logger.js";
import { sha256 } from "js-sha256";
import { RULE_GAME } from "./rule.js";

export class Kibble extends API {
  constructor(account) {
    super();
    this.account = account;
  }

  async login() {
    return new Promise(async (resolve, reject) => {
      await this.fetch("/auth/connect-telegram", "POST", null, {
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
          console.log(`Energy          : ${this.statistic.energy}`);
          console.log(`Points          : ${this.statistic.points}`);
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
          console.log(`Uncomplete Task : ${this.uncompletedTaskList.length}`);
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
          console.log(`-> Update task list and statistic`);
          console.log();
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async claimDailyBonus() {
    return new Promise(async (resolve, reject) => {
      await this.fetch("/tasks/daily-quest", "GET", this.token)
        .then(async (data) => {
          if (data.status == 400) {
            console.log(`-> Daily bonus claimed already`);
          } else {
            console.log(`-> Successfully claim daily bonus`);
            await this.getStatistic();
          }
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async tap(click) {
    return new Promise(async (resolve, reject) => {
      console.log(`-> Tapping for ${Math.round(click)} x`);
      const timeStartSendData = new Date().getTime() / 1000;
      const points = await this.validPoint(
        Math.round(click),
        this.statistic.level
      );
      const data = this.statistic;
      const taps =
        click === 0
          ? Math.round(points / 4)
          : click < data.energy
          ? click
          : data.energy - 10;
      const encryptData = `points=${points}&taps=${taps}&synctime=${timeStartSendData}`;
      const signatureVerify = await this.sha256EncryptAsync(encryptData);

      const tapBody = {
        taps: Math.round(click),
        points: points,
        synctime: timeStartSendData,
        signature: signatureVerify,
      };

      console.log(tapBody);
      await this.fetch("/points/click", "POST", this.token, tapBody)
        .then(async (data) => {
          this.statistic.points = data.points;
          this.statistic.energy = data.energy;
          console.log(`-> Successfully tap`);
          console.log(`Energy          : ${this.statistic.energy}`);
          console.log(`Points          : ${this.statistic.points}`);

          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  sha256EncryptAsync = async (data) => {
    const dataToBase64 = Buffer.from(data).toString("base64");
    const base64Key = "sy5khue9T2Nakezfj3SwpuLp5wD1QlVT";
    const hashStr = sha256.hmac.update(`${base64Key}`, `${dataToBase64}`);
    return hashStr.hex();
  };

  validPoint(tapCount, userLevel) {
    let totalPoints = 0;
    const levelMultiplier = RULE_GAME.POINT_BY_LEVEL[`lv${userLevel}`] || 1;

    if (tapCount > RULE_GAME.KEEP_CLICK.three_time.target) {
      totalPoints +=
        (tapCount - RULE_GAME.KEEP_CLICK.three_time.target) *
        RULE_GAME.KEEP_CLICK.three_time.value;
      tapCount = RULE_GAME.KEEP_CLICK.three_time.target;
    }
    if (tapCount > RULE_GAME.KEEP_CLICK.two_time.target) {
      totalPoints +=
        (tapCount - RULE_GAME.KEEP_CLICK.two_time.target) *
        RULE_GAME.KEEP_CLICK.two_time.value;
      tapCount = RULE_GAME.KEEP_CLICK.two_time.target;
    }
    if (tapCount > RULE_GAME.KEEP_CLICK.one_time.target) {
      totalPoints +=
        (tapCount - RULE_GAME.KEEP_CLICK.one_time.target) *
        RULE_GAME.KEEP_CLICK.one_time.value;
      tapCount = RULE_GAME.KEEP_CLICK.one_time.target;
    }

    totalPoints += tapCount * 1;
    totalPoints *= levelMultiplier;

    return totalPoints;
  }
}
