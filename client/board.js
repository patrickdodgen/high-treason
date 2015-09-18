Template.board.helpers({
  route: function() {
    return Session.get("currentPage") ===
      'board';
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

Template.board.events({
  'click .approve': function(e) {
    Meteor.call('vote', Game.getId(), true);
  },
  'click .reject': function(e) {
    Meteor.call('vote', Game.getId(), false);
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
