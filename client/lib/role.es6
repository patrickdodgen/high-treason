var DEFAULT_EVIL_QUERY = {include:{teams:['evil']}, exclude:{roles:['oberon']}};

var subquery = function(players, query) {
  var out = [];
  if(!query) return out;
  var q = function(key, playerKey) {
    var o = []
    if(query[key]) {
      for(let v of query[key]) {
        o = o.concat(players.find({[playerKey]:v}));
      }
    }
    return o;
  };
  return out.concat(q('roles', 'role')).concat(q('teams', 'team'));
};

var query = function(players, query) {
  var toInclude = subquery(players, query.include);
  var toExclude = subquery(players, query.exclude);
  for(let ex of toExclude){
    toInclude.removeElement(ex);
  }
  return toInclude;
};

Role = {
  getKnownPlayers:function() {
    var game = Game.get();
    var player = Game.getPlayer();
    var role = Roles.findOne({key:player.role});
    if (!role || !role.query) {
      if(player.team === 'evil')
        return query(game.players, DEFAULT_EVIL_QUERY);
      else
        return [];
    }

    if(role && role.query)
      return query(game.players, role.query);
    else
      return [];
  }
};
