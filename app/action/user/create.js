var userProvider = require( "../../model/provider/user-provider" );

module.exports = function( req, res ) {
  var user = userProvider.create( req.body )
    .success( function( u ) {
      res.send( u.values );
    } )
    .error( function( err ) {
      res.send( "Couldn't save user: " + err, 500 );
    })
}