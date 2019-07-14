module.exports = {
  env: process.env.NODE_ENV,
  knex: {
    client: 'pg',
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
  logger: {
    level: 'info',
  },
};
