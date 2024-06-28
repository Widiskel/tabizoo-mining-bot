// import moment from "moment";
import moment from "moment-timezone";
import fs from "fs";
import path from "path";

export class Helper {
  static sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  static randomUserAgent() {
    const list_useragent = [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.80 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/125.2535.60 Mobile/15E148 Safari/605.1.15",
      "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 EdgA/124.0.2478.104",
      "Mozilla/5.0 (Linux; Android 10; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 EdgA/124.0.2478.104",
      "Mozilla/5.0 (Linux; Android 10; VOG-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 OPR/76.2.4027.73374",
      "Mozilla/5.0 (Linux; Android 10; SM-N975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 OPR/76.2.4027.73374",
    ];
    return list_useragent[Math.floor(Math.random() * list_useragent.length)];
  }

  static readTime(milliseconds) {
    const date = moment.unix(milliseconds);
    return date.format("YYYY-MM-DD HH:mm:ss");
  }

  static getCurrentTimestamp() {
    const timestamp = moment().tz("Asia/Singapore").unix();
    return timestamp.toString();
  }

  static getSession(sessionName) {
    try {
      const files = fs.readdirSync(path.resolve(sessionName));
      const session = [];
      files.forEach((file) => {
        session.push(file);
      });
      return session;
    } catch (error) {
      throw Error(`Error reading sessions directory: ${error},`);
    }
  }

  static resetSession(sessionName) {
    try {
      const files = fs.readdirSync(path.resolve(sessionName));
      console.log("Deleting Sessions...");
      files.forEach((file) => {
        fs.rm(
          `${path.join(path.resolve("sessions"), file)}`,
          { recursive: true },
          (err) => {
            if (err) throw err;
          }
        );
      });
      console.info("Sessions reset successfully");
    } catch (error) {
      throw Error(`Error deleting session files: ${error},`);
    }
  }

  static createDir(dirName) {
    try {
      const dirPath = `sessions/${dirName}`;
      console.log(dirPath);
      fs.mkdir(dirPath, { recursive: true }, (err) => {
        if (err) throw err;
      });
      return dirPath;
    } catch (error) {
      throw Error(`Error deleting session files: ${error},`);
    }
  }
}
