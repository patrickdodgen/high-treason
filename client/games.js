Template.games.helpers({
  route: function() {
    // checkGameState();
    return Session.get("currentPage") === 'games';
  },
  username: function() {
    return Meteor.user().username;
  },
  games: function() {
    checkGameState();
    return Games.find({}, {
      sort: {
        createdAt: -1
      }
    });
  },
});

Template.games.events({
  "click .create": function() {
    Session.set('currentPage', 'lobbyCreation');
  },
  "click .join": function() {
    //if (Session.get("currentPage") !== 'games');
    Meteor.call('joinGame', this._id);
    Session.set('currentGame', this._id);
    Session.set('currentPage', 'lobby');
  }
});
