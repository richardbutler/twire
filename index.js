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
  app.use(express.bodyParser());
  app.set( "view engine", "jade" );
});

server.listen( 3000 );

core.broadcaster.on( "db:loaded", function() {
  routing.init( app, socket );
  socket.init( server );
});