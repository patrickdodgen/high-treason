GameModel = function(data) {
  this.data = data;
  this._id = data._id;
  if(!this.data.players)
    this.data.players = [];
}

GameModel.prototype.start = function() {
  console.log("STARTING GAME");
  // Assign roles
  var shuffledPlayers = this.data.players.concat([]).shuffle();
  var playerIdx = 0;
  var teamSizes = {good:0, evil:0};
  for(var i = 0; i < this.data.chosenRoles.length; i++) {
    var roleKey = this.data.chosenRoles[i];
    var role = Roles.findOne({key:this.data.chosenRoles[i]});
    var player = shuffledPlayers[playerIdx];
    teamSizes[role.team]++;
    player.role = role.key;
    player.team = role.team;
    playerIdx++;
  }
  if (playerIdx < this.data.players.length) {
    var totalGood = Utils.getGoodTeamSize(shuffledPlayers.length);
    var totalEvil = shuffledPlayers.length - totalGood;
    while(teamSizes.good < totalGood) {
      shuffledPlayers[playerIdx].role = 'none';
      shuffledPlayers[playerIdx].team = 'good';
      playerIdx++;
      teamSizes.good++;
    }
    while(teamSizes.evil < totalEvil) {
      shuffledPlayers[playerIdx].role = 'none';
      shuffledPlayers[playerIdx].team = 'evil';
      playerIdx++;
      teamSizes.evil++;
    }
  }
  this.data.currentPhase = GamePhase.PROPOSITION;
  this.save();
};

GameModel.prototype.addPlayer = function(playerName) {
  if(!this.getPlayer(playerName)) {
    this.data.players.push({name:playerName, role:null});
    this.save();
  }
};

GameModel.prototype.getPlayer = function(playerName) {
  return this.data.players[this.getPlayerIndex(playerName)];
};

GameModel.prototype.getPlayerIndex = function(playerName) {
  for (var i = 0; i < this.data.players.length; i++) {
    if(this.data.players[i].name === playerName)
      return i;
  }
  return null
};

GameModel.prototype.proposeTeam = function(team) {
  var playerIdx = this.getPlayerIndex(Meteor.user().username);
  if (playerIdx !== this.data.leaderIndex)
    throw new Meteor.Error("Cannot propose a team when not the leader");
  for (var i = 0; i < team.length; i++) {
    if (this.getPlayerIndex(team[i]) < 0)
      throw new Meteor.Error("Only players in the current game can be on a team");
  }
  var nextLeaderIndex = (this.data.leaderIndex+1)%this.data.players.length;
  this.data.currentTeam = team;
  this.data.leaderIndex = nextLeaderIndex;
  this.data.currentPhase = GamePhase.VOTE;
  this.save();
};

GameModel.prototype.hasPlayer = function(playerName) {
  return this.getPlayerIndex(playerName) !== null;
};

GameModel.prototype.dropPlayer = function(playerName) {
  var idx = this.getPlayerIndex(playerName);
  if(idx !== null) {
    this.data.players.splice(idx, 1);
    this.save();
  }
};
GameModel.prototype.save = function() {
  Games.update({_id:this._id}, this.data);
};
