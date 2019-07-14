module.exports = {
  knex: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
  },
  env: 'development',
};
