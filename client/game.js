Game = {
  get: function() {
    return Games.findOne({_id:Session.get('currentGame')});
  },
  set:function(id) {
    if(id && id._id)
      id = id._id;
    Session.set('currentGame', id);
  }
}
