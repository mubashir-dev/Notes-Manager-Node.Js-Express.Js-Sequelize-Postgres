require('dotenv').config()

module.exports={
  development:{
    "url": `${process.env.DB_CONNECTION}://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    "dialect": process.env.DB_CONNECTION
  }
}