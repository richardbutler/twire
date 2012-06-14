var Messaging = require( "./messaging" );

module.exports = (function() {
  var Router = {
    init: function( app ) {

      app.get( "/", function( req, res ) {
        res.render( "index" );
      });

      app.post( "/post", function( req, res ) {
        Messaging.post( req.body.message ).success( function( message ) {
          res.send( message.values );
        }).error( function( err ) {
          console.log( "couldn't save model", err );
          res.send( 500 );
        });
      });

    }
  }

  return Router;
})();