var auth = function(fn) {
  return function() {
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    } else {
      fn.apply(this, arguments);
    }
  };
};

var game = function(fn) {
  return auth(function(gameId) {
    if (!gameId)
      throw new Meteor.Error("invalid game-id: " + gameId);
    var game = Games.findOne({
      _id: gameId
    });
    if (!game)
      throw new Meteor.Error("invalid game-id: " + gameId);
    arguments[0] = game;
    fn.apply(this, arguments);
  });
};

var playerAdd = function(game, playerName) {
  if (game.players.indexOf(playerName) !== -1)
    return;
  Games.update({
    _id: game._id
  }, {
    $push: {
      players: playerName
    }
  });
};

Meteor.methods({
  createGame: auth(function(maxPlayers, chosenRoles) {
    if (maxPlayers < CONSTANTS.minPlayers || maxPlayers > CONSTANTS.maxPlayers)
      throw new Meteor.Error("invalid number of players specified");
    Games.insert({
      players: [Meteor.user().username],
      leaderIndex: 0,
      currentTeam: [],
      missionLayout: CONSTANTS.missionLayouts[maxPlayers - 5],
      currentMission: 0,
      maxPlayers: maxPlayers,
      chosenRoles: chosenRoles,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  }),
  joinGame: game(function(game) {
    playerAdd(game, Meteor.user().username);
  }),
  addBot: game(function(game) {
    var botNumber = 0;
    var botName = 'Simpleton 0 (Bot)';
    while (game.players.indexOf(botName) > -1)
      botName = 'Simplteon ' + (++botNumber) + ' (Bot)';
    playerAdd(game, botName);
  }),
  proposeTeam: game(function(game, team) {
    if (game.players.indexOf(Meteor.user().username !== game.leaderIndex))
      throw new Meteor.Error("Cannot propose a team when not the leader");
    for (var i = 0; i < team.length; i++) {
      if (!game.players.indexOf(team[i]) > -1)
        throw new Meteor.Error("Only players in the current game can be on a team");
    }
    var nextLeaderIndex = (game.leaderIndex+1)%game.players.length;
    Games.update({
      _id: game._id
    }, {
      $set: {
        currentTeam: team,
        leaderIndex: nextLeaderIndex
      },
    });
  }),
  leaveGame: game(function(game) {
    if (game.players.indexOf(Meteor.user().username) === -1)
      return;
    Games.update({
      _id: game._id
    }, {
      $pull: {
        players: Meteor.user().username
      }
    });
  }),
  closeGame: game(function(game) {
    if (game.owner === Meteor.userId())
      Games.remove({
        _id: game._id
      });
  })
});
