Games = new Mongo.Collection("games");
Roles = new Mongo.Collection("roles");

if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("games");
  Meteor.subscribe("roles");
  var Router = Backbone.Router.extend({
	  routes: {
		"games/create" : "lobbyCreation",
		"lobby" : "lobby",
		"games": "games",
		"board" : "board",
		"": "splash"
	  },
	  splash: function () {
	   Session.set('currentPage', 'splash');
	  },
	  games: function () {
	   Session.set('currentPage', 'games');
	  },
	  lobbyCreation: function () {
	   Session.set('currentPage', 'lobbyCreation');
	  },
	  lobby: function () {
	   Session.set('currentPage', 'lobby');
	  },
	  board: function() {
	   Session.set('currentPage', 'board');
	  }
  });

  var app_router = new Router;

  Backbone.history.start({ pushState : true});

  if (!Meteor.user()) {
	  Session.set('currentPage', 'splash');
  }
  else
  {
	  checkGameState();
  }

  Template.body.events({
	"click .logout": function () {
      Meteor.logout();
	  Session.set('currentPage', 'splash');
    },
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  Accounts.onLogin( function (){
	  Session.set('currentPage', 'games');
  });

  checkGameState = function() {
      var gameId = Session.get("currentGame");
      if (!gameId)
      {
        var game = Games.findOne({ currentPlayerIds: Meteor.userId()});
        if (game)
          gameId = game._id;
      }
      if (!gameId) {
        Session.set('currentPage', 'games');
      }
      else {
        Session.set('currentPage', 'lobby');
        Session.set('currentGame', gameId);
      }
    }
}

if (Meteor.isServer) {

  Accounts.validateNewUser(function(user){
      if(user.username && /.*\(Bot\)/.test(user.username))
        throw new Meteor.Error(403, "That user already exists.");
      if(user.username && user.username.length >= 3)
        return true;
      throw new Meteor.Error(403, "Usernames must be at least 3 characters long.");
  });

  // This code only runs on the server
  Meteor.publish("games", function () {
    return Games.find();
  });

  Meteor.publish("roles", function () {
    return Roles.find();
  });
}
