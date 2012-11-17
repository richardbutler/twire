require.config({
  paths: {
    "zepto": "/js/lib/zepto.min",
    "socket.io": "/socket.io/socket.io"
  }
});

define([
  "socket.io",
  "zepto"
],
function( sio ) {

  var $postForm = $( "form#post-form" ),
      socket = io.connect( "http://localhost:3000" );

  function log() {
    $( "#log" ).append( Array.prototype.join.call( arguments, "," ) + "<br />" );
  }

  log( "client connected" );

  socket.on( "message", function( message ) {
    log( "got message", message );
  });
  socket.on( "follow", function( message ) {
    log( "got follow", message );
  });
  socket.on( "unfollow", function( message ) {
    log( "got unfollow", message );
  });

  $postForm.on( "submit", function( event ) {
    //socket.emit( "message", message );
    $.post( $postForm.attr( "action" ), $postForm.serialize() );

    event.preventDefault();
  });

});