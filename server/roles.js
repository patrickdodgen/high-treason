Roles.remove({});

var upsertRole = function(name, team, key) {
  if(!key)
    key = name.toLowerCase();
  Roles.update({key:key}, {
    name:name,
    team:team,
    key:key
  }, {upsert:true});
};

upsertRole("Merlin", 'good');
upsertRole("Percival", 'good');
upsertRole("Assassin", 'evil');
upsertRole("Morgana", 'evil');
upsertRole("Mordred", 'evil');
upsertRole("Oberon", 'evil');
