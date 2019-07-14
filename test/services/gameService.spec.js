import HttpError from 'standard-http-error';

import createGameService, { GAME_STATE } from '../../src/services/gameService';

describe('services/gameService', () => {
  const id = '827094e8-e38e-47db-b8da-cf167e16d3be';

  let randomGameId;
  let gameService;

  beforeEach(() => {
    randomGameId = generateRandomString('game-id');

    gameService = createGameService({ knex });

    return knex.migrate.rollback().then(() => knex.migrate.latest()).then(() => knex.seed.run());
  });

  afterEach(() => knex.migrate.rollback());

  describe('#getGameById', () => {
    it('returns a resolved Promise with game for a valid ID', () => {
      const response = gameService.getGameById({ id });

      return expect(response).to.be.eventually.fulfilled.then((game) => {
        expect(game.id).to.equal(id);
      });
    });

    it('returns a resolved Promise with null for an invalid ID', () => {
      const response = gameService.getGameById({ id: randomGameId });

      return expect(response).to.eventually.be.undefined;
    });
  });

  describe('#listGames', () => {
    it('returns a resolved Promise with an array of games', () => {
      const response = gameService.listGames();

      return expect(response).to.eventually.be.fulfilled.then((games) => {
        expect(games).to.have.length(2);
      });
    });
  });

  describe('#createGame', () => {
    let word;

    beforeEach(() => {
      word = generateRandomString('word');
    });

    it('returns a resolved Promise with a new game given a word', () => {
      const response = gameService.createGame({ word });

      return expect(response).to.eventually.be.fulfilled.then((game) => {
        expect(game.word).to.equal(word);
        expect(game.remainingGuesses).to.equal(6);
        expect(game.state).to.equal(GAME_STATE.STARTED);

        return knex('games').then((games) => {
          expect(games).to.have.length(3);
        });
      });
    });

    it('returns a rejected Promise if an unknown error is thrown', () => {
      const err = new Error('A bad knex!');
      const badKnex = sinon.stub().withArgs('games').throws(err);

      gameService = createGameService({ knex: badKnex });

      const response = gameService.createGame({ word });

      return expect(response).to.be.rejectedWith(err);
    });
  });

  describe('#deleteGame', () => {
    it('returns a resolved Promise if a valid game ID was given', () => {
      const response = gameService.deleteGame({ id });

      return expect(response).to.eventually.be.fullfiled;
    });

    it('returns a resolved Promise if deleting with an invalid game ID', () => {
      const response = gameService.deleteGame({ id: randomGameId });

      return expect(response).to.eventually.be.fulfilled;
    });
  });

  describe('#updateGame', () => {
    it('returns a rejected Promise if updating an invalid game', () => {
      const response = gameService.updateGame({ id: randomGameId, lettersGuessed: 'a' });

      return expect(response).to.be.rejectedWith(HttpError);
    });

    it('returns a resolved Promise if a game is updated successfully', () => {
      const game = {
        id,
        lettersGuessed: 'a',
      };
      const response = gameService.updateGame(game);

      return expect(response).to.eventually.be.fulfilled.then(() =>
        knex('games').where({ id }).then(([actual]) => {
          expect(actual.lettersGuessed).to.equal(game.lettersGuessed);
        }));
    });
  });
});
