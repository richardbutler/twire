var session = require( "./model/session" ),
    model = require( "./model/bootstrap" ),
    $ = require( "zepto-node" ),
    core = require( "./core" );

module.exports = ( function() {
  return {

    post: function( message ) {
      var m = model.Message.build({
        body: message,
        userId: session.user.id
      });
      m.compile();
      core.broadcaster.emit( "socket:emit", m );
      return m.save();
    },

    repost: function( messageId ) {
      var d = new $.Deferred();
      model.Message.find( messageId )
        .success( function( orig ) {
          orig.repost( session.user.id )
            .success( function( m ) {
              d.resolve( m );
            });
        });
      return d;
    }

  }
})();