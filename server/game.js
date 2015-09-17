var auth = function(fn) {
  return function(){
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    else {
      fn.apply(this, arguments);
    }
  };
};

var game = function(fn) {
  return auth(function(gameId) {
    if(!gameId)
      throw new Meteor.Error("invalid game-id: "+gameId);
    var game = Games.findOne({_id:gameId});
    if(!game)
      throw new Meteor.Error("invalid game-id: "+gameId);
    arguments[0] = game;
    fn.apply(this, arguments);
  });
};

Meteor.methods({
  createGame:auth(function(maxPlayers, chosenRoles) {
		if (maxPlayers < CONSTANTS.minPlayers || maxPlayers > CONSTANTS.maxPlayers)
			throw new Meteor.Error("invalid number of players specified");
		Games.insert({
			players: [Meteor.user().username],
			currentPlayerCount: 1,
			missionLayout: CONSTANTS.missionLayouts[maxPlayers-5],
			maxPlayers: maxPlayers,
			chosenRoles: chosenRoles,
			createdAt: new Date(),
			owner: Meteor.userId(),
			username: Meteor.user().username
		});
  }),
  joinGame:game(function(game){
    if(game.players.indexOf(Meteor.user().username) !== -1)
      return;
    Games.update(
      {_id:game._id},
      {
        $push:{
          players:Meteor.user().username
        },
        $inc: {currentPlayerCount:1}
      }
    )
  }),
  leaveGame:game(function(game){
    if(game.players.indexOf(Meteor.user().username) === -1)
      return;
    Games.update(
      { _id: game._id},
      {
        $pull: { currentPlayerNames: Meteor.user().username },
        $inc: { currentPlayerCount: -1 }
      }
    );
  }),
  closeGame:game(function(game){
    if(game.owner === Meteor.userId())
      Games.remove({_id:game._id});
  })
});
