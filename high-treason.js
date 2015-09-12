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

var missionLayouts = [
	[2,3,2,3,3],
	[2,3,4,3,4],
	[2,3,3,4,4],
	[3,4,4,5,5],
	[3,4,4,5,5],
	[3,4,4,5,5]
];

Meteor.methods({
	createGame: function (maxPlayers, chosenRoles) {
		// Make sure the user is logged in before inserting a task
		if (! Meteor.userId()) {
		  throw new Meteor.Error("not-authorized");
		}
		if (maxPlayers < 5 || maxPlayers > 10)
		{
			throw new Meteor.Error("invalid number of players specified");
		}

		Games.insert({
			currentPlayerIds: [Meteor.userId()],
			currentPlayerNames: [Meteor.user().username],
			currentPlayerCount: 1,
			missionLayout: missionLayouts[maxPlayers-5],
			maxPlayers: maxPlayers,
			chosenRoles: chosenRoles,
			createdAt: new Date(),
			owner: Meteor.userId(),
			username: Meteor.user().username
		});
	},
	joinGame: function (gameId) {
			Games.update(
				{ _id: gameId},
				{
					$push: { currentPlayerNames: Meteor.user().username,
							 currentPlayerIds: Meteor.userId() },
					$inc: { currentPlayerCount: 1 }
				}
			);
	},
	closeLobby: function (gameId) {
		Games.remove( {_id: gameId} );
	},
	leaveLobby: function (gameId) {
		Games.update(
			{ _id: gameId},
			{
				$pull: { currentPlayerNames: Meteor.user().username,
						 currentPlayerIds: Meteor.userId() },
				$inc: { currentPlayerCount: -1 }
			}
		);
	},
});

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish("games", function () {
    return Games.find();
  });

  Meteor.publish("roles", function () {
    return Roles.find();
  });
}
