Template.board.helpers({
  route: function() {
    return Session.get("currentPage") ===
      'board';
  },
  getRoleDesc: function() {
    var player = Game.getPlayer();
    var role = player.role;
    role = Roles.findOne({key:role});
    if(role && role.desc) {
      return role.desc;
    }
    else if(player.team === 'evil') {
      return 'You know these players to be evil.';
    }
    return ""
  },
  getKnownPlayers: function() {
    return Role.getKnownPlayers();
  },
  getTeam: function () {
    return Game.getPlayer().team;
  },
  getRole: function() {
    return Game.getPlayer().role;
  },
  game: function() {
    return Game.get();
  },
  currentMissionSize: function() {
    var game = Game.get();
    if(game) {
      return game.missionLayout[game.currentMission];
    }
  },
  votingPhase: function() {
    return Game.get().currentPhase === GamePhase.VOTE;
  },
  currentlyLeader: function() {
    var game = Game.get();
    if(game) {
      return game.leaderIndex === Game.getPlayerIndex() && game.currentPhase === GamePhase.PROPOSITION;
    }
  }
});

Template.player.helpers({
  nonVotingPhase: function() {
    return Game.get().currentPhase !== GamePhase.VOTE;
  },
  lastVote: function() {
    if(this.vote === null)
      return 'None';
    return this.vote?'Approve':'Reject';
  }
})

Template.board.events({
<<<<<<< HEAD
  'click .approve': function(e) {
    Meteor.call('vote', Game.getId(), true);
  },
  'click .reject': function(e) {
    Meteor.call('vote', Game.getId(), false);
=======
  'click .reassignRoles': function(e) {
    e.preventDefault();
    Meteor.call('reassignRoles', Game.getId());
>>>>>>> d74126c0e1175ee6a47c53cdc03b72f9b23fb3cc
  },
  'submit #teamForm': function(e) {
    e.preventDefault();
    var team = [];
    for (var i = 0; i < e.target.team.length; i++) {
      if(e.target.team[i].checked)
        team.push(e.target.team[i].value);
    }
    Meteor.call('proposeTeam', Game.getId(), team);
  }
})
