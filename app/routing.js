module.exports = (function() {
  var Router = {
    init: function( app ) {

      // App
      app.get( "/", require( "./action/index" ) );

      // Posts
      app.post( "/post", require( "./action/post/create" ) );

      // Users
      app.post( "/users/create", require( "./action/user/create" ) );
      app.get( "/users/follow/:userToFollowId", require( "./action/user/follow" ) );

    }
  }

  return Router;
})();