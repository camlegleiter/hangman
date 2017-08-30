[![Build Status](https://travis-ci.org/camlegleiter/hangman.svg?branch=master)](https://travis-ci.org/camlegleiter/hangman)
[![Coverage Status](https://coveralls.io/repos/github/camlegleiter/hangman/badge.svg?branch=master)](https://coveralls.io/github/camlegleiter/hangman?branch=master)

## Hangman Game

This is an Express-based Hangman game.

Commands:
```bash
# Install and run
$ yarn
$ yarn migrate
$ yarn start

# Run (all) tests
# Note: test targets must be run with `NODE_ENV=test` for test database configuration to be applied. The yarn targets below already set this before running so it shouldn't need to be set manually.
$ yarn test

# Run unit tests only
$ yarn test:unit

# Run HTTP tests only
$ yarn test:http

# View code coverage
$ yarn test:coverage

# Lint code
$ yarn lint
```

## Hangman API

### Game Server Status
Note: This API is useful for health-check processes, as it is lightweight and includes details about the server's status that can provide additional context of the current server health.

Most of the returned values from the `/status` endpoint are calculated using the [Node OS](https://nodejs.org/api/os.html) module. Additional documentation can be found there.

#### Request
```
GET /status
```

#### Response
```
HTTP 1/1 200 OK
Content-Type: application/json
{
  "freemem": number,
  "freemempercent": number,
  "instanceId": "uuid",
  "loadavg": [number, number, number],
  "totalmem": number,
  "usedmem": number,
  "uptime": number
}
```
where:
* `freemem` is the total amount of free system memory, in bytes.
* `freemempercent` is the percentage of free memory available. This is calculated using: `(freemem / totalmem) * 100)`.
* `instanceId` is the server's unique "identifier". When the server is running, this value will not change between polls of the `/status` API. When the server is restarted, this value will be updated. This can be useful to help determine if a server was restarted in between health checks, or in general.
* `loadavg` is an array with three values of CPU load for the last 1, 5 and 15 minutes.
* `totalmem` is the total amount of system memory, in bytes.
* `usedmem` is the total amount of used system memory, in bytes.
* `uptime` is the total time in seconds the system (running the server) has been up.

##### Response Status Codes
200 OK - The response is successful
5XX - The server is unavailable

### List Games
#### Request
```
GET /api/v1/games
```

#### Response
```
HTTP 1/1 200 OK
Content-Type: application/json
[
  {
    "id": "uuid",
    "wordLength": "string",
    "lettersGuessed": "string",
    "lettersMatched": "string",
    "remainingGuesses": number,
    "state": "string",
    "word": "string",
    "createdOn": date,
    "updatedOn": date
  },
  ...
]
```
where the response is a JSON array containing zero or more games. See the [Get Game API](#get-game) for details on the fields included in each game object.

##### Response Status Codes
* 200 OK - The response was returned successfully

### Get Game
#### Request
```
GET /api/v1/games/<id>
```
where:
* `id` (required) is a unique identifier for a game in progress.

#### Response
```
HTTP 1/1 200 OK
Content-Type: application/json
{
  "id": "uuid",
  "wordLength": "string",
  "lettersGuessed": "string",
  "lettersMatched": "string",
  "remainingGuesses": number,
  "state": "string",
  "word": "string",
  "createdOn": date,
  "updatedOn": date
}
```
where:
* `id` is a unique identifier for a particular game.
* `wordLength` is the length of the word. This is provided for display purposes by a view.
* `lettersGuessed` is a string containing each character guessed by the client whether correct or not. The letters are returned lowercase. For example, if the client has guessed "a", "e", and "s", then the returned string will be "aes".
* `lettersMatched` is a string containing each correctly-guessed character made by the client. Any letters that have not been guessed by the client are displayed using an underscore character "\_". For example, if the game's word is "apple" and the client has guessed "a", "e", and "s", then the returned string will be "a\_\_\_e".
* `remainingGuesses` is a number between 0 (inclusive) and 6 (inclusive) indicating the number of guesses the client can make before the game is over. New games start with 6 guesses, and the value decreases as the client makes incorrect guesses.
* `state` is the current game state, and is represented by one of three values:
  * `started`: The game is in progress and the client can make guesses for the word,
  * `won`: The game is over and the client successfully guessed the game word,
  * `lost`: The game is over and the client failed to guess the game word.
* `word` is the game's word. The `word` is randomly selected from a [dictionary](./src/lib/dictionary.txt) of common English words containing letters from the English alphabet. No phrases or spaces are used. This value is not intended for display in a view (or what would be the purpose of guessing?), and may be removed in future versions of the API.
* `createdOn` is a date indicating when the game was created. This value is not intended for display in a view.
* `updatedOn` is a date indicating the last time when the game was modified, mainly as the client makes successful or failed guesses. This value is not intended for display in a view.

##### Response Status Codes
* 200 OK - The response was returned successfully
* 404 Not Found - No game was found with the client-provided `id`.

### Create Game
#### Request
```
POST /api/v1/games
```

#### Response
```
HTTP 1/1 201 Created
Content-Type: application/json
{
  "id": "uuid",
  "wordLength": "string",
  "lettersGuessed": "string",
  "lettersMatched": "string",
  "remainingGuesses": number,
  "state": "string",
  "word": "string",
  "createdOn": date,
  "updatedOn": date
}
```
where the response contains a new game object. New games have the following in common:
* `lettersGuessed` is an empty string.
* `lettersMatched` is an empty string.
* `remainingGuesses` is the number **6**, as this is typically the number of guesses it takes before the Hangman character is completely drawn, indicating a failed game.
* `state` is set to "started" to indicate the game is in progress.

See the [Get Game API](#get-game) for details on the fields included in each game object.

##### Response Status Codes
* 201 Created - A game was successfully created and returned in the response

### Guess a Letter
#### Request
```
PUT /api/v1/games/<id>
Content-Type: application/json
{
  "letter": "string"
}
```
where:
* `id` (URI parameter, required) is a unique identifier for a game in progress.
* `letter` (body, required) is a single lowercase letter in the English alphabet (the letters "a" through "z").

#### Response
```
HTTP 1/1 200 OK
Content-Type: application/json
{
  "id": "uuid",
  "wordLength": "string",
  "lettersGuessed": "string",
  "lettersMatched": "string",
  "remainingGuesses": number,
  "state": "string",
  "word": "string",
  "createdOn": date,
  "updatedOn": date
}
```
where the response contains the game updated based on the client's guess. If the client has already guessed the letter in a previous request, no penalty is applied to the game. If the client has not guessed the letter previously, the following changes will be made to the game:
* `lettersGuessed` will have the guess appended to the end of the string. The letter will be added regardless of the guess being correct or incorrect.
* `lettersMatched` will be updated to reflect a correct guess by placing the letter at each index the guess matches against the game's word. For example:
  * Assuming no other guesses have been made, if the game word is "apple" and the client guessed the letter "p", then `lettersMatched` will be "\_pp\_\_".
  * If the game word is "apple", and the client has guessed the letters "a", "e", "s" previously, and "p" is guessed, then `lettersMatched` will be "app\_e".
* `remainingGuesses` will be decremented for each failed guess. For example, if the game word is "apple" and the client incorrectly guesses the letter "w" in a new game, `remainingGuesses` will be 5 in the response.
* `state` will change when the game is over. No further guesses will be allowed to a game that is over. `state` will change to "won" or "lost" based on the following criteria:
  * If the client has guessed all letters of the game word (i.e., `lettersMatched` will be the same as `word`) before `remainingGuesses` hits 0, the game is over and `state` will be "won".
  * If the client has not guessed all letters of the game word before `remainingGuesses` is 0, the game is over and `state` will be "lost".
  
See the [Get Game API](#get-game) for details on the fields included in each game object.

##### Response Status Codes
* 200 OK - The guess was submitted successfully and the updated game was returned in the response.
* 400 Bad Request - The guessed character must be a single lowercase letter in the English alphabet.
* 404 Not Found - No game was found with the client-provided `id` in the request URI.

### Delete a Game
Note: This API is idempotent--multiple requests to delete the same game will always result in a `204 No Content`.

#### Request
```
DELETE /api/v1/games/<id>
```
where:
* `id` (required) is a unique identifier for a game in progress.

#### Response
```
HTTP 1/1 204 No Content
```

##### Response Status Codes
* 204 No Content - The game was successfully deleted.
