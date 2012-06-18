var Messaging = require( "../../messaging" );

module.exports = function( req, res ) {
  Messaging.post( req.body.message )
    .success( function( message ) {
      res.send( message.values );
    })
    .error( function( err ) {
      res.send( "Couldn't save model: " + err, 500 );
    });
}