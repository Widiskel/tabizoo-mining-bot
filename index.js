import { Config } from "./src/config/config.js";
import { RULE_GAME } from "./src/core/rule.js";
import { Tabizoo } from "./src/core/tabizoo.js";
import { Telegram } from "./src/core/telegram.js";
import { Helper } from "./src/utils/helper.js";
import logger from "./src/utils/logger.js";
import twist from "./src/utils/twist.js";

async function operation(user, query, queryObj) {
  const tabizoo = new Tabizoo(user, query, queryObj);
  twist.log(`Getting User Info`, user, tabizoo);
  await tabizoo.login();
  await Helper.sleep(5000, user, `Successfully Get User Info`, tabizoo);

  twist.log(`Getting Mining Info`, user, tabizoo);
  await tabizoo.getUserMining();
  await Helper.sleep(5000, user, `Successfully Get Mining Info`, tabizoo);

  twist.log(`Getting Reward Pool Info`, user, tabizoo);
  await tabizoo.getUserReward();
  await Helper.sleep(5000, user, `Successfully Get Reward Pool Info`, tabizoo);

  twist.log(`Try To Check In`, user, tabizoo);
  await tabizoo.checkIn();
  await Helper.sleep(5000, user, `Successfully Check In`, tabizoo);

  while (tabizoo.user.coins > RULE_GAME.LEVELUP[tabizoo.user.level + 1]) {
    twist.log(`Try To Upgrade Mining Level`, user, tabizoo);
    await tabizoo.levelUp();
    await Helper.sleep(
      1000,
      user,
      `Successfully Upgrade Mining Level`,
      tabizoo
    );
  }

  await Helper.sleep(
    tabizoo.mining.nextClaimTimeInSecond * 1000,
    user,
    `Waiting for retry again in ${Helper.msToTime(
      tabizoo.mining.nextClaimTimeInSecond * 1000
    )} to Claim mining Reward`,
    tabizoo
  );

  twist.clear();
  twist.clearInfo();
  await operation(user, query, queryObj);
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
