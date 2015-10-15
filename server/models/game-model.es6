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
  this._changePhase(GamePhase.PROPOSITION);
  this.save();
};

GameModel.prototype._changePhase = function(newPhase) {
  var prevPhase = this.data.currentPhase;
  this.data.currentPhase = newPhase;

  if(prevPhase === GamePhase.MISSION) {

  }
  if(newPhase === GamePhase.VOTE) {
    this._clearVotes();
  }
  if(newPhase === GamePhase.MISSION) {
    this._clearMissionActions();
  }
  for (var i = 0; i < this.data.players.length; i++) {
    var player = this.data.players[i];
    if(CONSTANTS.botNameRegex.test(player.name)) {
      if(newPhase === GamePhase.VOTE) {
          this.vote(i, true);
      } else if (newPhase === GamePhase.PROPOSITION && this.data.leaderIndex === i) {
          this.proposeTeam(i, this.data.players.map(function(p) {return p.name}).splice(0, this.data.missionLayout[this.data.currentMission]));
      } else if (newPhase === GamePhase.MISSION && this.data.currentTeam.indexOf(player.name) >= 0) {
          this.doMission(i, player.team !== 'evil');
      }
    }
  }
  this.save();
}

GameModel.prototype._clearVotes = function() {
  for (var i = 0; i < this.data.players.length; i++) {
    this.data.players[i].vote = null;
  }
  this.data.numVotes = 0;
}

GameModel.prototype._clearMissionActions = function() {
  for (var i = 0; i < this.data.players.length; i++) {
    this.data.players[i].missionPass = null;
  }
  this.data.numMissionActions = 0;
}

GameModel.prototype.addPlayer = function(playerName) {
  if(!this.getPlayer(playerName)) {
    this.data.players.push({name:playerName, role:null, vote: null});
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

GameModel.prototype.vote = function(playerIndex, approve) {
  if(approve === null)
    return;
  if(!this.data.currentPhase === GamePhase.VOTE)
    throw new Meteor.Error("Cannot vote outside of voting phase");
  var player = this.data.players[playerIndex];
  if(player.vote == null && approve !== null) {
    this.data.numVotes++;
  }
  player.vote = approve;
  if(this.data.numVotes >= this.data.players.length) {
    var numApproves = 0;
    for(var i = 0; i < this.data.players.length; i++) {
      numApproves += this.data.players[i].vote?1:0;
    }
    if(numApproves > this.data.players.length - numApproves)
      this._changePhase(GamePhase.MISSION);
    else {
      this._changePhase(GamePhase.PROPOSITION);
    }
  }
  else
    this.save();
}

GameModel.prototype.proposeTeam = function(playerIndex, team) {
  if(team === null)
    return;
  if(!this.data.currentPhase === GamePhase.PROPOSITION)
    throw new Meteor.Error("Cannot propose outside of proposition phase");
  if (playerIndex !== this.data.leaderIndex)
    throw new Meteor.Error("Cannot propose a team when not the leader");
  for (var i = 0; i < team.length; i++) {
    if (this.getPlayerIndex(team[i]) < 0)
      throw new Meteor.Error("Only players in the current game can be on a team");
  }
  var nextLeaderIndex = (this.data.leaderIndex+1)%this.data.players.length;
  this.data.currentTeam = team;
  this.data.leaderIndex = nextLeaderIndex;
  this._changePhase(GamePhase.VOTE);
  this.save();
};

GameModel.prototype.doMission = function(playerIndex, pass) {
  if(pass === null)
    return;
  if(!this.data.currentPhase === GamePhase.MISSION)
    throw new Meteor.Error("Cannot act on missions when not mission phase");
  var player = this.data.players[playerIndex];
  if(this.data.currentTeam.indexOf(player.name) < 0)
    throw new Meteor.Error("Cannot act on missions when not on mission team");
  if(player.missionPass == null && pass !== null) {
    this.data.numMissionActions++;
  }
  player.missionPass = pass;
  if(this.data.numMissionActions >= this.data.currentTeam.length) {
    var missionFailed = false;
    for(var i = 0; i < this.data.players.length; i++) {
      var playerFailed = this.data.players[i].missionPass !== null && !this.data.players[i].missionPass;
      missionFailed = missionFailed || playerFailed;
    }
    this.data.missionResults.push(!missionFailed);
    var numFails = 0;
    for(var i = 0; i < this.data.missionResults.length; i++)
    {
      numFails += this.data.missionResults[i]?1:0;
    }
    if(numFails < 3 && this.data.missionResults.length - numFails < 3)
      this._changePhase(GamePhase.PROPOSITION);
    else
      this._changePhase(GamePhase.END)
  }
  else
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
