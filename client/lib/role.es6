var DEFAULT_EVIL_QUERY = {include:{teams:['evil']}, exclude:{roles:['oberon']}};

var subquery = function(players, query) {
  var out = [];
  if(!query) return out;
  var q = function(key) {
    var o = []
    if(query[key]) {
      for(let v of query[key]) {
        o.concat(players.find({[key]:v}));
      }
    }
    return o;
  };
  return out.concat(q('roles')).concat(q('teams'));
};

var query = function(players, query) {
  var toInclude = subquery(players, query.include);
  var toExclude = subquery(players, query.exclude);
  for(let ex of toExclude) {
    toInclude.removeElement(ex);
  }
  return toInclude;
};

Role = {
  getKnownPlayers:function() {
    var game = Game.get();
    var player = Game.getPlayer();
    var role = null;
    if (player.role !== 'none') {
      role = Roles.findOne({key:player.role});
    }
    if(player.team === 'good' && !role)
      return [];
    else if(player.team === 'evil' && !role)
      return query(game.players, DEFAULT_EVIL_QUERY);
    else if(role.query)
      return query(game.players, role.query);
    else
      return [];
  }
};
