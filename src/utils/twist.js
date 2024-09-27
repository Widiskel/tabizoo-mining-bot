import { Twisters } from "twisters";
import { Tabizoo } from "../core/tabizoo.js";
import { Helper } from "./helper.js";
import logger from "./logger.js";

class Twist {
  constructor() {
    /** @type  {Twisters}*/
    this.twisters = new Twisters();
  }

  /**
   * @param {string} acc
   * @param {Tabizoo} tabizoo
   * @param {string} msg
   * @param {string} delay
   */
  log(msg = "", acc = "", tabizoo = new Tabizoo(), delay) {
    if (delay == undefined) {
      logger.info(`${acc.id} - ${msg}`);
      delay = "-";
    }
    if (!tabizoo.user) {
      this.twisters.put(acc.id, {
        text: `
================= Account ${acc.id} =============
Name : ${acc.firstName} ${acc.lastName}

Status : ${msg}
==============================================`,
      });
      return;
    }

    const level = tabizoo.user.level;
    const coins = tabizoo.user.coins;
    const hasCheckedIn = tabizoo.user.hasCheckedIn;
    const streak = tabizoo.user.streak;

    const mining = tabizoo.mining ?? {};
    const rate = mining.rate ?? "-";
    const limit = mining.top_limit ?? "-";
    const current = mining.current ?? "-";
    let nextClaimTimestamp = mining.next_claim_timestamp;
    nextClaimTimestamp = nextClaimTimestamp / 1000;
    let now = Date.now();
    let diff = nextClaimTimestamp - now;
    const claim = diff ?? "-";

    this.twisters.put(acc.id, {
      text: `
================= Account ${acc.id} =============
Name : ${acc.firstName} ${acc.lastName}
Level              : ${level}
Coins              : ${coins}
Already Check In   : ${hasCheckedIn == false ? "N" : "Y"}
Check In Streak    : ${streak}

Mining Rate        : ${rate}
Mining limit       : ${limit}
Current            : ${current}
Claim In           : ${Helper.msToTime(claim)}

Status : ${msg}
Delay : ${delay}
==============================================`,
    });
  }
  /**
   * @param {string} msg
   */
  info(msg = "") {
    this.twisters.put(2, {
      text: `
==============================================
Info : ${msg}
==============================================`,
    });
    return;
  }

  clearInfo() {
    this.twisters.remove(2);
  }

  clear() {
    this.twisters.flush();
  }
}
export default new Twist();
