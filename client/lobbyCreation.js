Template.lobbyCreation.helpers({
  route: function() {
    return Session.get("currentPage") === 'lobbyCreation';
  },
  roles: function() {
    return Roles.find();
  }
});

Template.lobbyCreation.events({
  "click .leave": function() {
    Session.set('currentPage', 'games');
  },
  "submit .lobbyCreation": function(event) {
    event.preventDefault();
    var maxPlayers = event.target.maxPlayers.value;

    var roles = Roles.find();

    var chosenRoles = [];

    roles.forEach(function(role) {
      if (event.target[role.name].checked)
        chosenRoles.push(role.name);
    });

    Meteor.call('createGame', maxPlayers, chosenRoles);
    Session.set('currentPage', 'lobby');
  }
});
