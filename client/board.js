var getGame = function() {
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
};

Template.board.helpers({
  route: function() {
    return Session.get("currentPage") ===
      'board';
  },
  game: function() {
    return getGame();
  },
  currentMissionSize: function() {
    var game = getGame();
    if(game) {
      return game.missionLayout[game.currentMission];
    }
  }
});

Template.board.events({
  'submit #teamForm': function(e) {
    e.preventDefault();
    var team = [];
    for (var i = 0; i < e.target.team.length; i++) {
      if(e.target.team[i].checked)
        team.push(e.target.team[i].value);
    }
    console.log(team);
  }
})
