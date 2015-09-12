Template.board.helpers({
  route: function() {
    return Session.get("currentPage") ===
      'board';
  },
  gameStuff: function() {
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
  }
});
