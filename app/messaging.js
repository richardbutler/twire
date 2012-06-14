var session = require( "./model/session" );
var model = require( "./model/bootstrap" );
var $ = require( "zepto-node" );

module.exports = ( function() {
  return {

    post: function( message ) {
      var m = model.Message.build({
        body: message,
        userId: session.user.id
      });
      m.compileTags();
      console.log( m.body, m.values );
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