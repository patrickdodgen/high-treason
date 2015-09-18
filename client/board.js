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
  currentlyLeader: function() {
    var game = Game.get();
    if(game) {
      return game.leaderIndex === Game.getPlayerIndex();
    }
  }
});

Template.board.events({
  'click .reassignRoles': function(e) {
    e.preventDefault();
    Meteor.call('reassignRoles', Game.getId());
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
