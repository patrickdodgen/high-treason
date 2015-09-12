Template.splash.helpers({
  route: function() {
    return Session.get("currentPage") === 'splash';
  }
});
