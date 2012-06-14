var express = require( "express" ),
    http = require( "http" ),
    routing = require( "./app/routing" ),
    socket = require( "./app/socket" ),
    model = require( "./app/model/bootstrap" );

var app = express(),
    server = http.createServer( app );

app.configure( function() {
  app.use( "/", express.static( __dirname + "/public" ) );
  app.use(express.bodyParser());
  app.set( "view engine", "jade" );
});

server.listen( 3000 );

routing.init( app, socket );
socket.init( server );