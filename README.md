# KIBBLE BOT

Kibble game on ton Bot

## BOT FEATURE

- Auto complete missions
- Auto claim daily bonus
- Auto tap

## Prerequisite

- Git
- Node JS
- TELEGRAM_APP_ID & TELEGRAM_APP_HASH Get it from [Here](https://my.telegram.org/auth?to=apps)

## Setup & Configure BOT

1. clone project repo and cd to project dir `cd kibble-bot`
2. run `npm install`
3. run `cp src/config/config_tmp.js src/config/config.js`
   To configure the app, open `src/config.js` and add your telegram app id and hash there
4. run `mkdir sessions`
5. to start the app run `npm run start`

## Setup Session

1. run bot `npm run start`
2. choose option 1 create session
3. enter session name
4. enter your phone number starting with countrycode ex : `628xxxxxxxx`
5. after creating sessions, choose 3 start bot
6. if something wrong with your sessions, reset sessions first

## Note

This bot using telegram sessions. if you ever one of my bot that use telegram sessions, you can just copy the sessions folder to this bot.
