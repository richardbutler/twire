var userProvider = require( "../../model/provider/user-provider" );

module.exports = function( req, res ) {
  if ( req.params.userToFollowId == userProvider.currentUserId ) {
    res.send( "You cannot follow yourself, as much as you may want to.", 401 );
    return;
  }

  var graph = userProvider.getSocialGraph();
  graph.follow(
    req.params.userToFollowId,
    function( err ) {
      if ( err ) {
        res.send( "Couldn't follow user: " + err, 500 );
      } else {
        graph.getFollowing( function( err, following ) {
          if ( err ) {
            res.send( "Couldn't get followers: " + err, 500 );
          } else {
            userProvider.findAll( { where: { id: following } } )
              .success( function( users ) {
                res.send( users );
              } )
              .error( function( err ) {
                res.send( "Couldn't find users: " + err, 500 );
              })
          }
        } );
      }
    }
  );
}