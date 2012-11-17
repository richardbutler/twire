var express = require( "express" ),
    http = require( "http" ),
    routing = require( "./app/routing" ),
    socket = require( "./app/socket" ),
    core = require( "./app/core" );

var app = express(),
    server = http.createServer( app ),
    db = require( "./app/model/bootstrap" );

app.configure( function() {
  app.use( "/", express.static( __dirname + "/public" ) );
  app.use( express.bodyParser() );
  /* TODO: Fix - this will print 500 code reasons to console
  app.use( function( req, res, next ) {
    var send = res.send;
    res.send = function() {
      console.log( ">", arguments );
      if ( arguments.length == 2 && arguments[ 1 ] == 500 ) {
        console.log( "500 code sent:", arguments[ 0 ] );
      }
      send.call( this, arguments );
    }
    next.call( this, arguments );
  });*/
  app.use( app.router );

  app.set( "view engine", "jade" );
});

server.listen( 3000 );

core.broadcaster.on( "db:loaded", function() {
  routing.init( app, socket );
  socket.init( server );
});