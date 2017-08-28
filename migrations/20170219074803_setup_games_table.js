const values = require('lodash/values');
// XXX: Need to pull this out into a separate location.
//      knex does not like ES6 yet, so it cannot be transpiled
const GAME_STATE = ['started', 'won', 'lost'];

exports.up = (knex) => Promise.all([
  knex.schema.createTable('games', (t) => {
    t.uuid('id').primary().unique().notNull();
    t.string('wordLength').notNull();
    t.string('lettersGuessed').notNull();
    t.string('lettersMatched').notNull();
    t.integer('remainingGuesses').notNull();
    t.enu('state', GAME_STATE).notNull();
    t.string('word').notNull();
    t.timestamp('createdOn').notNull().defaultTo(knex.fn.now());
    t.timestamp('updatedOn').notNull().defaultTo(knex.fn.now());
  }),
]);

exports.down = (knex) => Promise.all([
  knex.schema.dropTable('games'),
]);
