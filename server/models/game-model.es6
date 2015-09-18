GameModel = function(data) {
  this.data = data;
  this._id = data._id;
  if(!this.data.players)
    this.data.players = [];
}

GameModel.prototype.start = function() {

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
