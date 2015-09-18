Roles.remove({});

var upsertRole = function(name, team, query, desc) {
  var key = name.toLowerCase();
  Roles.update({key:key}, {
    name:name,
    team:team,
    query:query,
    desc:desc,
    key:key,
  }, {upsert:true});
};

upsertRole("Merlin", 'good', {include:{teams:['evil']}, exclude:{roles:['mordred']}}, 'You know these players to be evil.');
upsertRole("Percival", 'good', {include:{roles:['merlin', 'morgana']}}, 'You know these players to be either Morgana or Merlin');
upsertRole("Assassin", 'evil');
upsertRole("Morgana", 'evil');
upsertRole("Mordred", 'evil');
upsertRole("Oberon", 'evil', {include:{}}, 'You know nothing.');
