# Notes-Manager-Node.Js-Express.Js-Sequelize-Postgres
This is simplistic backend implementation of handling notes management.

| Module | Detail |
| ------ | ------ |
| Authentication | Responsible for Authentication and Authorization |
| Notes | Responsible for Notes Management |

## Installation
Before moving forword you need to install postgres for smoothing running,I have used postgres sql with Sequelize ORM.
To setup this system on local you need to follow the process.
```sh
node i nodemon -g
npm i
```

Copy and Change .env file present in project

```sh
#DATABASE
DB_CONNECTION="postgres"
DB_HOST=""
DB_USERNAME=""
DB_PASSWORD=""
DB_PORT=""
DB_NAME=""
#Mail Settings
MAIL_HOST=""
MAIL_PORT=""
MAIL_USER=""
MAIL_PASSWORD=""
MAIL_FROM_ADDRESS=""
MAIL_FROM_NAME=""
#JWT
JWT_SECRET=""
JWT_TIMEOUT_DURATION=""
JWT_REFRESH_DURATION=""
JWT_REFRESH_SECRET=""
#SYSTEM
PORT=
```
Run Migrations
```sh
npx sequelize-cli db:migrate
```

After making changes in .env,now you are  good to go
```sh
npm run serve 
```