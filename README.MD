# Planning Application Watcher

> Mini Node.js app to watch for new planning applications in my local area by scraping the relevant local council page at regular intervals with `Puppeteer` and notifying me by email using Gmail SMTP via `Nodemailer`.

1. Pull repo
2. `npm install`
3. Add env file with required details as given in `env.example`
4. Add `config_date.txt` file in `/config/`
5. Configure cron schedule in `crons.js`
6. `npm run prod` to start production server with `pm2`
