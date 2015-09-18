
if (Meteor.isClient) {
  checkGameState = function() {
    var game = Game.get();
    if (!game) {
      Session.set('currentPage', 'games');
    } else {
      var gameId = game._id;
      Session.set('currentPage', game.currentPhase === GamePhase.LOBBY ? 'lobby' : 'board');
      Session.set('currentGame', gameId);
    }
  }

  // This code only runs on the client
  Meteor.subscribe("games");
  Meteor.subscribe("roles");
  var Router = Backbone.Router.extend({
    routes: {
      "games/create": "lobbyCreation",
      "lobby": "lobby",
      "games": "games",
      "board": "board",
      "": "splash"
    },
    splash: function() {
      Session.set('currentPage', 'splash');
    },
    games: function() {
      Session.set('currentPage', 'games');
    },
    lobbyCreation: function() {
      Session.set('currentPage', 'lobbyCreation');
    },
    lobby: function() {
      Session.set('currentPage', 'lobby');
    },
    board: function() {
      Session.set('currentPage', 'board');
    }
  });

  var app_router = new Router;

  Backbone.history.start({
    pushState: true
  });

  if (!Meteor.user()) {
    Session.set('currentPage', 'splash');
  } else {
    checkGameState();
  }

  Template.body.events({
    "click .logout": function() {
      Meteor.logout();
      Session.set('currentPage', 'splash');
    },
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  Accounts.onLogin(function() {
    Session.set('currentPage', 'games');
  });

}

if (Meteor.isServer) {

  Accounts.validateNewUser(function(user) {
    if (user.username && CONSTANTS.botNameRegex.test(user.username))
      throw new Meteor.Error(403, "That user already exists.");
    if (user.username && user.username.length >= 3)
      return true;
    throw new Meteor.Error(403, "Usernames must be at least 3 characters long.");
  });

  // This code only runs on the server
  Meteor.publish("games", function() {
    return Games.find();
  });

  Meteor.publish("roles", function() {
    return Roles.find();
  });
}
