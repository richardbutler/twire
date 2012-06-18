var User = require( "../bootstrap" ).User,
    session = require( "../session" ),
    _ = require( "underscore" );

var UserProvider = function() {
  this.currentUserId = session.userId;
}

_.extend( UserProvider.prototype, {

  /**
   * Create a user by parameters.
   * @param params
   * @return Promise
   */
  create: function( params ) {
    var user = User.create( params );
    return user.save();
  },

  /**
   * Return a user by ID.
   * @param id The ID of the user
   * @return User
   */
  getById: function( id ) {
    return User.find( id );
  },

  /**
   * Simple find proxy
   */
  find: function( stuff ) {
    return User.find( stuff );
  },

  /**
   * Simple findAll proxy
   */
  findAll: function( stuff ) {
    return User.findAll( stuff );
  },

  /**
   * Return the social graph for the current logged in user
   * @return SocialGraph
   */
  getSocialGraph: function() {
    return this.getSocialGraphForUser( session.userId );
  },

  /**
   * Return the social graph for the current logged in user
   * @return SocialGraph
   */
  getSocialGraphForUser: function( user ) {
    userId = typeof user == "number" ? user : user.id;
    return User.getSocialGraph( userId );
  },

  /**
   * Return current user
   */
  getCurrentUser: function() {
    return session.user;
  }
});

module.exports = new UserProvider();