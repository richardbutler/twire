var User = require( "./bootstrap" ).User;

module.exports = ( function() {
  var Session = function Session( userId ) {
    var self = this;

    this.userId = userId;

    User.find( this.userId )
      .success( function( user ) {
        self.user = user;
      } );
  }

  return new Session( 1 );
})();