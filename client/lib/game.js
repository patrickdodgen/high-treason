Game = {
  getPlayersOnTeam:function(team) {
    return this.get().players.find({team:team});
  },
  getPlayerIndex: function() {
    var game = this.get();
    for(var i = 0; i < game.players.length; i++) {
      var player = game.players[i];
      if(player.name === Meteor.user().username)
        return i;
    }
    return null;
  },
  getPlayerWithRole:function(role) {
    return this.get().players.find({role:role})[0];
  },
  getPlayer:function() {
    return this.get().players.find({name:Meteor.user().username})[0];
  },
  get: function() {
    return Games.findOne({$or: [{_id:Session.get('currentGame')}, {players: { $elemMatch: {name: Meteor.user().username} }}]});
  },
  getId: function() {
    return Session.get('currentGame');
  },
  set:function(id) {
    if(id && id._id)
      id = id._id;
    Session.set('currentGame', id);
  }
}
