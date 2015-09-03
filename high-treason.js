Games = new Mongo.Collection("games");
Roles = new Mongo.Collection("roles");

if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("games");
  Meteor.subscribe("roles");
  var Router = Backbone.Router.extend({
	  routes: {
		"lobby" : "lobby",
		"games/create" : "lobbyCreation",
		"games": "games",
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
	  }
  });

  var app_router = new Router;

  Backbone.history.start({ pushState : true, root : "" });
  
  var checkGameState = function() {
	var gameId = Session.get("currentGame");
	if (!gameId)
	{
		var guard = Games.findOne({ currentPlayerIds: Meteor.userId()});
		gameId = guard && guard._id;
	}
	if (!gameId) {
		Session.set('currentPage', 'games');
	}
	else {
		Session.set('currentPage', 'lobby');
		Session.set('currentGame', gameId);
	}
  };
  
  if (!Meteor.user()) {
	  Session.set('currentPage', 'splash');
  }
  else
  {
	  checkGameState();
  }
  
  Template.splash.helpers({
	route: function() {
		return Session.get("currentPage") === 'splash';
	}
  });
  
  
  Template.games.helpers({
	route: function() {
		return Session.get("currentPage") === 'games';
	},
	username: function () {
		return Meteor.user().username;
	},
	games: function() {
		checkGameState();
		return Games.find({}, {sort: {createdAt: -1}});
	},
  });
  
  Template.games.events({
	"click .create": function () {
		Session.set('currentPage','lobbyCreation');
		//Meteor.call('createGame', 10);
	}
  });
  
  Template.games.events({
	"click .join": function () {
		Meteor.call('joinGame', this._id);
		Session.set('currentGame', this._id);
		Session.set('currentPage','lobby');
	}
  });
  
  Template.lobbyCreation.helpers({
	route: function() {
		return Session.get("currentPage") === 'lobbyCreation';
	},
	roles: function() {
		return Roles.find();
	}
  });
  
  Template.lobbyCreation.events({
	"click .leave": function () {
		Session.set('currentPage', 'games');
	},
	"submit .lobbyCreation": function(event) {
		event.preventDefault();
		var maxPlayers = event.target.maxPlayers.value;
		
		var roles = Roles.find();
	 
		var chosenRoles = [];
	 
		roles.forEach(function(role) {
			if(event.target[role.name].checked)
				chosenRoles.push(role.name);
		});
		
		Meteor.call('createGame', maxPlayers, chosenRoles);
		Session.set('currentPage', 'lobby');
	}
  });
    
  Template.lobby.helpers({
	route: function() {
		return Session.get("currentPage") === 'lobby';
	},
	gameStuff: function() {
		return Games.findOne( { _id: Session.get('currentGame') });
	},
	isOwner: function() {
		return Meteor.userId() === Games.findOne( {_id: Session.get('currentGame') }).owner;
	},
	isLobbyFull: function() {
		var obj = Games.findOne( { _id: Session.get('currentGame') });
		return obj.currentPlyaerCount === obj.maxPlayers;
	}
  });
  
  Template.lobby.events({
	 "click .startGame": function() {
		 // do some stuff here
	 },
	 "click .closeLobby": function() {
		 Meteor.call('closeLobby', Session.get('currentGame'));
		 Session.set('currentGame', null);
		 Session.set('currentPage', 'games');
	 }
  });
  
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
}

Meteor.methods({
	createGame: function (maxPlayers, chosenRoles) {
		// Make sure the user is logged in before inserting a task
		if (! Meteor.userId()) {
		  throw new Meteor.Error("not-authorized");
		}
	 
		Games.insert({
			currentPlayerIds: [Meteor.userId()],
			currentPlayerNames: [Meteor.user().username],
			currentPlayerCount: 1,
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
				$push: { currentPlayerIds: Meteor.userId() },
				$push: { currentPlayerNames: Meteor.user().username },
				$inc: { currentPlayerCount: 1 }
			}
		);
	},
	closeLobby: function (gameId) {
		Games.remove( {_id: gameId} );
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
