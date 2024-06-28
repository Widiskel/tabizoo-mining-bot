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
  await kibble.getStatistic();
  await kibble.getTask();

  console.log(`Full Nane       : ${kibble.statistic.fullname}`);
  console.log(`Energy          : ${kibble.statistic.energy}`);
  console.log(`Points          : ${kibble.statistic.points}`);
  console.log(`Level           : ${kibble.statistic.level}`);
  console.log(`Uncomplete Task : ${kibble.uncompletedTaskList.length}`);
  console.log();

  for (const task of kibble.uncompletedTaskList) {
    console.log(`-> Completing task ${task.task.name}`);
    await kibble.missionQuest(task);
    console.log(`Points          : ${kibble.statistic.points}`);
    console.log(`Uncomplete Task : ${kibble.uncompletedTaskList.length}`);
    console.log();
  }
  console.log(`-> All task Completed`);
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
      console.log(`All Account Processed`);
      console.log();
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
    await startBot();
  } catch (error) {
    console.log("Error During executing bot", error);
  }
})();
