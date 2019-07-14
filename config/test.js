module.exports = {
  knex: {
    connection: process.env.TEST_DATABASE_URL,
  },
  env: 'test',
  logger: {
    level: 'error',
  },
};
