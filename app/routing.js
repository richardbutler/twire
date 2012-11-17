var social = require( "./action/user/social" );

module.exports = (function() {
  var Router = {
    init: function( app ) {

      // App
      app.get( "/", require( "./action/index" ) );

      // Posts
      app.post( "/post", require( "./action/post/create" ) );

      // Users
      app.post( "/users/create", require( "./action/user/create" ) );
      app.get( "/users/following", social.following );
      app.get( "/users/follow/:userToFollowId", social.follow );
      app.get( "/users/unfollow/:userToUnfollowId", social.unfollow );

    }
  }

  return Router;
})();