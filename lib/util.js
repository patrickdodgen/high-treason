Array.prototype.find = function(d) {
  var out = [];
  for(var i = 0; i < this.length; i++) {
    var o = this[i];
    for(var k in d) {
      if(o[k] === d[k])
        out.push(o);
    }
  }
  return out;
};

// http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
Array.prototype.shuffle = function() {
  var array = this;
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

Utils = {
  getEvilTeamSize:function(totalPlayers) { return Math.ceil(totalPlayers / 3); },
  getGoodTeamSize:function(totalPlayers) { return totalPlayers - this.getEvilTeamSize(totalPlayers); }
};
