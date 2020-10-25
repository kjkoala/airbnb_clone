
const Sequelize = require('sequelize')

const user = 'root',
  password = 'root',
  host = '127.0.0.1',
  database = 'airbnb'

  const sequelize = new Sequelize(database, user, password, {
    host,
    dialect: 'mysql',
    logging: false
  })

module.exports = sequelize