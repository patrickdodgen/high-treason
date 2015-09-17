Template.lobby.helpers({
  route: function() {
    return Session.get("currentPage") === 'lobby';
  },
  gameStuff: function() {
    var game = Game.get();
    if (!game) {
      Game.set(null);
      Session.set("currentPage", "games");
      return null;
    } else {
      return game;
    }
  },
  isOwner: function() {
    var game = Game.get();
    return game && Meteor.userId() === game.owner;
  },
  isLobbyFull: function() {
    var game = Game.get();
    return game && game.currentPlayerCount === game.maxPlayers;
  },
});

Template.lobby.events({
  "click .startGame": function() {
    // do some stuff here
    Session.set("currentPage", "board");
  },
  "click .closeGame": function() {
    Meteor.call('closeGame', Session.get('currentGame'));
    Game.set(null);
    Session.set('currentPage', 'games');
  },
  "click .addBot": function() {
    Meteor.call('addBot', Session.get('currentGame'));
  },
  "click .leaveGame": function() {
    Meteor.call('leaveGame', Session.get('currentGame'));
    Game.set(null);
    Session.set('currentPage', 'games');
  }
});
