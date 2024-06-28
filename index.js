import { Kibble } from "./src/core/kibble.js";
import { Telegram } from "./src/core/telegram.js";
import { Helper } from "./src/utils/helper.js";
import logger from "./src/utils/logger.js";

async function operation(user) {
  const kibble = new Kibble(user);
  console.log(`-> Connecting to kibble`);
  await kibble.login();
  console.log(`-> Connected`);
  console.log(`-> Getting User Statistic`);
  console.log();
  console.log(`Full Nane       : ${user.firstName + " " + user.lastName}`);
  await kibble.getStatistic();
  console.log(`Level           : ${kibble.statistic.level}`);
  await kibble.getTask();

  console.log();

  console.log(`-> Claiming Daily bonus`);
  await kibble.claimDailyBonus();

  for (const task of kibble.uncompletedTaskList) {
    console.log();
    console.log(`-> Completing task ${task.task.name}`);
    await kibble.missionQuest(task);
  }
  console.log(`-> All task Completed`);
  const tapList = Helper.randomTapCount(kibble.statistic.energy, 2, 5);
  for (const tap of tapList) {
    console.log();
    await kibble.tap(tap);
    const rand = Helper.random(2000, 5000);
    console.log(`-> Sleeping for ${rand / 1000} Second`);
    await Helper.sleep(rand);
  }
  console.log(`-> Auto tap executed successfully`);

  console.log();
  console.log(
    `-> Account ${user.firstName + " " + user.lastName}(${
      user.id
    }) Processing Complete, `
  );
}

async function startBot() {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info(`BOT STARTED`);
      const tele = await new Telegram();
      await tele.init();

      const sessionList = Helper.getSession("sessions");
      for (const acc of sessionList) {
        await tele.useSession("sessions/" + acc);
        tele.session = acc;

        const user = await tele.client.getMe();

        console.log("USER INFO");
        console.log("ID       : " + user.id);
        console.log("Username : " + user.username);
        console.log("Phone    : " + user.phone);
        console.log();

        await tele
          .resolvePeer()
          .then(async () => await tele.initWebView())
          .catch((err) => {
            throw err;
          });
        await tele.disconnect().then(async () => {
          console.log();
          await Helper.sleep(1000);
        });

        await operation(user);
      }

      console.log();
      console.log(`-> All Account Processed`);
      console.log(
        `-> Sleeping for ${Helper.msToTime(1000000)} before run again`
      );
      console.log();
      await Helper.sleep(1000000);
      await startBot().then(resolve);
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
    await startBot();
  } catch (error) {
    console.log("Error During executing bot", error);
  }
})();
