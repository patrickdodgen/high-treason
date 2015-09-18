// Remove all games
// Games.remove({});

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
    arguments[0] = new GameModel(game);
    fn.apply(this, arguments);
  });
};

Meteor.methods({
  createGame: auth(function(maxPlayers, chosenRoles) {
    if (maxPlayers < CONSTANTS.minPlayers || maxPlayers > CONSTANTS.maxPlayers)
      throw new Meteor.Error("invalid number of players specified");
    var gameId = Games.insert({
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
    var game = new GameModel(Games.findOne({_id:gameId}));
    game.addPlayer(Meteor.user().username);
  }),
  joinGame: game(function(game) {
    game.addPlayer(Meteor.user().username);
  }),
  startGame: game(function(game){

  }),
  addBot: game(function(game) {
    var botNumber = 0;
    var botName = 'Simpleton 0 (Bot)';
    while(game.hasPlayer(botName))
      botName = 'Simpleton ' + (++botNumber) + ' (Bot)';
    game.addPlayer(botName);
  }),
  proposeTeam: game(function(game, team) {
    var playerIdx = game.getPlayerIndex(Meteor.user().username);
    if (playerIdx !== game.data.leaderIndex)
      throw new Meteor.Error("Cannot propose a team when not the leader");
    for (var i = 0; i < team.length; i++) {
      if (game.getPlayerIndex(team[i]) < 0)
        throw new Meteor.Error("Only players in the current game can be on a team");
    }
    var nextLeaderIndex = (game.data.leaderIndex+1)%game.data.players.length;
    game.data.currentTeam = team;
    game.data.leaderIndex = nextLeaderIndex;
    game.save();
  }),
  leaveGame: game(function(game) {
    if(game.getPlayerIndex(Meteor.user().username) === -1)
      return;
    game.dropPlayer(Meteor.user().username);
  }),
  closeGame: game(function(game) {
    if (game.data.owner === Meteor.userId())
      Games.remove({
        _id: game._id
      });
  })
});
