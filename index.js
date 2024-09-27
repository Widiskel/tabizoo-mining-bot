import { Config } from "./src/config/config.js";
import { RULE_GAME } from "./src/core/rule.js";
import { Tabizoo } from "./src/core/tabizoo.js";
import { Telegram } from "./src/core/telegram.js";
import { Helper } from "./src/utils/helper.js";
import logger from "./src/utils/logger.js";
import twist from "./src/utils/twist.js";

async function operation(user, query, queryObj) {
  try {
    const tabizoo = new Tabizoo(user, query, queryObj);
    twist.log(`Getting User Info`, user, tabizoo);
    await tabizoo.getUserProfile();
    await Helper.sleep(2000, user, `Successfully Get User Info`, tabizoo);

    twist.log(`Getting Mining Info`, user, tabizoo);
    await tabizoo.getUserMining();
    await Helper.sleep(2000, user, `Successfully Get Mining Info`, tabizoo);

    twist.log(`Getting Spin Info`, user, tabizoo);
    await tabizoo.getSpinInfo();
    await Helper.sleep(2000, user, `Successfully Get Spin Info`, tabizoo);

    let checkInDate = new Date(tabizoo.user.check_in_date).toDateString();
    let today = new Date().toDateString();
    if (checkInDate !== today) {
      twist.log(`Try To Check In`, user, tabizoo);
      await tabizoo.checkIn();
      await Helper.sleep(2000, user, `Successfully Check In`, tabizoo);
    }

    let nextClaimTimestamp = tabizoo.mining.next_claim_timestamp;
    nextClaimTimestamp = nextClaimTimestamp / 1000;
    let now = Date.now();
    let delay = nextClaimTimestamp - now;
    if (delay <= 0) {
      twist.log(`Try To Claiming mining Reward`, user, tabizoo);
      await tabizoo.claimMining();
      await Helper.sleep(2000, user, `Mining Reward Claimed`, tabizoo);
    }

    twist.log(`Try Play Spin`, user, tabizoo);
    while (tabizoo.spin.energy.energy != 0) {
      await tabizoo.playSpin();
      await Helper.sleep(2000, user, `Successfully Play Spin`, tabizoo);
    }

    await Helper.sleep(
      delay,
      user,
      `Waiting for retry again in ${Helper.msToTime(
        delay
      )} to Claim mining Reward`,
      tabizoo
    );

    twist.clear();
    twist.clearInfo();
    await operation(user, query, queryObj);
  } catch (error) {
    throw error;
  }
}

let init = false;
async function startBot() {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info(`BOT STARTED`);
      if (
        Config.TELEGRAM_APP_ID == undefined ||
        Config.TELEGRAM_APP_HASH == undefined
      ) {
        throw new Error(
          "Please configure your TELEGRAM_APP_ID and TELEGRAM_APP_HASH first"
        );
      }
      const tele = await new Telegram();
      if (init == false) {
        await tele.init();
        init = true;
      }

      const sessionList = Helper.getSession("sessions");
      const paramList = [];

      for (const acc of sessionList) {
        await tele.useSession("sessions/" + acc);
        tele.session = acc;
        const user = await tele.client.getMe();
        const query = await tele
          .resolvePeer()
          .then(async () => {
            return await tele.initWebView();
          })
          .catch((err) => {
            throw err;
          });

        const queryObj = Helper.queryToJSON(query);
        await tele.disconnect();
        paramList.push([user, query, queryObj]);
      }

      const promiseList = paramList.map(async (data) => {
        await operation(data[0], data[1], data[2]);
      });

      await Promise.all(promiseList);
      resolve();
    } catch (error) {
      logger.info(`BOT STOPPED`);
      logger.error(JSON.stringify(error));
      reject(error);
    }
  });
}

(async () => {
  try {
    logger.info("");
    logger.info("Application Started");
    console.log("TABIZOO BOT");
    console.log("By : Widiskel");
    console.log("Dont forget to run git pull to keep up to date");
    await startBot();
  } catch (error) {
    twist.clear();
    twist.clearInfo();
    console.log("Error During executing bot", error);
  }
})();
