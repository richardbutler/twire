var userProvider = require( "../../model/provider/user-provider" ),
    broadcaster = require( "../../core" ).broadcaster;

module.exports = {
  following: function( req, res ) {
    var graph = userProvider.getSocialGraph();
    graph.getFollowing( function( err, following ) {
      if ( err ) {
        res.send( err, 500 );
      } else {
        userProvider.findAll( { where: { id: following } } )
          .success( function( users ) {
            res.send( users );
          } )
          .error( function( err ) {
            res.send( "Couldn't find users: " + err, 500 );
          })
      }
    });
  },
  follow: function( req, res ) {
    var userToFollowId = req.params.userToFollowId,
        graph;

    if ( userToFollowId == userProvider.currentUserId ) {
      res.send( "You cannot follow yourself, as much as you may want to.", 401 );
      return;
    }

    graph = userProvider.getSocialGraph();
    graph.getFollowing( function( err, following ) {
      if ( err ) {
        res.send( "Couldn't get following: " + err, 500 );
      } else if ( following.indexOf( userToFollowId ) >= 0 ) {
        res.send( "You are already following this user", 401 );
      } else {
        userProvider.findAll( { where: { id: [ userToFollowId ] } } )
          .success( function( users ) {
            var user = users[ 0 ];
            if ( user ) {
              graph.follow( userToFollowId, function( err ) {
                if ( err ) {
                  res.send( "Couldn't follow user: " + err, 500 );
                } else {
                  broadcaster.emit( "user:follow", userToFollowId );
                  res.send( user );
                }
              });
            } else {
              res.send( "Couldn't find user with ID of " + userToFollowId + ": " + err, 500 );
            }
          });
      }
    });
  },
  unfollow: function( req, res ) {
    var userToUnfollowId = req.params.userToUnfollowId,
      graph;

    if ( userToUnfollowId == userProvider.currentUserId ) {
      res.send( "You cannot unfollow yourself, as much as you may want to.", 401 );
      return;
    }

    console.log( "unfollowing", userToUnfollowId );

    graph = userProvider.getSocialGraph();
    graph.getFollowing( function( err, following ) {
      if ( err ) {
        res.send( "Couldn't get following: " + err, 500 );
      } else if ( following.indexOf( userToUnfollowId ) == -1 ) {
        res.send( "You aren't already following this user", 401 );
      } else {
        userProvider.findAll( { where: { id: [ userToUnfollowId ] } } )
          .success( function( users ) {
            var user = users[ 0 ];
            if ( user ) {
              graph.unfollow( userToUnfollowId, function( err ) {
                if ( err ) {
                  res.send( "Couldn't unfollow user: " + err, 500 );
                } else {
                  broadcaster.emit( "user:unfollow", userToUnfollowId );
                  res.send( 200 );
                }
              });
            } else {
              res.send( "Couldn't find user: " + err, 500 );
            }
          } )
      }
    });
  }
}