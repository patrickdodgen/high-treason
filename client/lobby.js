Template.lobby.helpers({
  route: function() {
    return Session.get("currentPage") === 'lobby';
  },
  gameStuff: function() {
    var game = Games.findOne({
      _id: Session.get('currentGame')
    });
    if (!game) {
      Session.set("currentGame", null);
      Session.set("currentPage", "games");
      return null;
    } else {
      return game;
    }
  },
  isOwner: function() {
    return Meteor.userId() === Games.findOne({
      _id: Session.get('currentGame')
    }).owner;
  },
  isLobbyFull: function() {
    var obj = Games.findOne({
      _id: Session.get('currentGame')
    });
    return obj.currentPlayerCount == obj.maxPlayers;
  },
});

Template.lobby.events({
  "click .startGame": function() {
    // do some stuff here
    Session.set("currentPage", "board");
  },
  "click .closeLobby": function() {
    Meteor.call('closeLobby', Session.get('currentGame'));
    Session.set('currentGame', null);
    Session.set('currentPage', 'games');
  },
  "click .leaveLobby": function() {
    Meteor.call('leaveLobby', Session.get('currentGame'));
    Session.set('currentGame', null);
    Session.set('currentPage', 'games');
  }
});
