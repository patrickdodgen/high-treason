var upsertRole = function(name, key) {
  if(!key)
    key = name.toLowerCase();
  Roles.update({key:key}, {
    name:name,
    key:key
  }, {upsert:true});
};

upsertRole("Merlin");
upsertRole("Percival");
upsertRole("Assassin");
upsertRole("Morgana");
upsertRole("Mordred");
upsertRole("Oberon");
