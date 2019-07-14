import Promise from 'bluebird';

import { GAME_STATE } from '../../src/services/gameService';

describe('/api/v1/games', () => {
  const gameId = '827094e8-e38e-47db-b8da-cf167e16d3be';
  const word = 'pineapple';
  let randomGameId;
  let requestAgent;

  beforeEach(() => {
    randomGameId = generateRandomString('game-id');

    requestAgent = request(app);

    return knex.migrate.rollback().then(() => knex.migrate.latest()).then(() => knex.seed.run());
  });

  afterEach(() => knex.migrate.rollback());

  describe('GET /', () => {
    it('returns a 200 with an array of game objects', () =>
      requestAgent
        .get('/api/v1/games/')
        .accept('json')
        .then((res) => {
          expect(res.ok).to.be.ok;

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(2);
          expect(res.body[0].id).to.be.a('string');
        }));
  });

  describe('GET /:id', () => {
    it('returns a 200 with a corresponding game for a valid game ID', () =>
      requestAgent
        .get(`/api/v1/games/${gameId}`)
        .accept('json')
        .then((res) => {
          expect(res.ok).to.be.ok;

          expect(res.body.id).to.equal(gameId);
        }));

    it('returns a 404 for a game that does not exist', () =>
      requestAgent
        .get(`/api/v1/games/${randomGameId}`)
        .accept('json')
        .then((res) => {
          // expect(res.notFound).to.be.ok;
          expect(res.status).to.equal(404);

          const { statusCode, message } = res.body;
          expect(statusCode).to.equal(404);
          expect(message).to.contain(`No game with ID ${randomGameId} exists.`);
        }));
  });

  describe('POST /', () => {
    it('returns a 201 with a new game', () =>
      requestAgent
        .post('/api/v1/games')
        .accept('json')
        .then((res) => {
          expect(res.status).to.equal(201);

          expect(res.body.id).to.be.ok;
        }));
  });

  describe('DELETE /:id', () => {
    it('returns a 204 to indicate a game was successfully removed', () =>
      requestAgent
        .post('/api/v1/games')
        .accept('json')
        .then((res) => res.body.id)
        .then((id) =>
          requestAgent
            .delete(`/api/v1/games/${id}`))
        .then((res) => {
          expect(res.status).to.equal(204);
        }));

    it('returns a 204 even if removing a game that does not exist', () =>
      requestAgent
        .delete(`/api/v1/games/${randomGameId}`)
        .then((res) => {
          expect(res.status).to.equal(204);
        }));
  });

  describe('PUT /:id', () => {
    it('returns a 400 to indicate the guessed letter has too many characters', () =>
      requestAgent
        .put(`/api/v1/games/${gameId}`)
        .type('application/json')
        .send({ letter: 'ab' })
        .accept('json')
        .then((res) => {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal('A guess must be a single letter');
        }));

    it('returns a 200 when guessing letters of a word and when a game is won', () => {
      function reducer(promise, letter) {
        return promise.then(() =>
          requestAgent
            .put(`/api/v1/games/${gameId}`)
            .type('application/json')
            .send({ letter })
            .then((res) => {
              expect(res.status).to.equal(200);
              expect(res.body.lettersGuessed).to.contain(letter);
              expect(res.body.remainingGuesses).to.equal(6);
              return res;
            }));
      }

      const response = word.split('').reduce(reducer, Promise.resolve());

      return expect(response).to.eventually.be.fulfilled.then((res) => {
        const game = res.body;
        expect(game.state).to.equal(GAME_STATE.WON);
        expect(game.lettersMatched).to.equal(word);
      });
    });
  });
});
