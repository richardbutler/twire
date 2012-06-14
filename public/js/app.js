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

  console.log( "client connected" );

  socket.on( "message", function( message ) {
    console.log( "got message", message );
  });

  $postForm.on( "submit", function( event ) {
    //socket.emit( "message", message );
    $.post( $postForm.attr( "action" ), $postForm.serialize() );

    event.preventDefault();
  });

});