module.exports = (function() {
  var sio, SocketManager, Socket, _, userProvider;

  sio = require( "socket.io" );
  _ = require( "underscore" );
  userProvider = require( "./model/provider/user-provider" );
  core = require( "./core" );

  SocketManager = {
    init: function( app ) {
      var io = sio.listen( app ),
          self = this;

      console.log( "socket init" );

      io.sockets.on( "connection", function( socket ) {
        console.log( "socket connected" );
        self.sockets.push( new Socket( socket ) );
      });

      this.io = io;
      this.sockets = [];
    },
    socketClosed: function( socket ) {
      this.sockets = _( this.sockets ).without( socket );
    },
    send: function( message ) {
      this.io.sockets.emit( "message", message );
    },
    sendToRoom: function( room, message ) {
      console.log( "emitting message", room, message );
      this.io.sockets.in( room ).emit( "message", message );
    }
  }

  Socket = function( io ) {
    _( this ).bindAll( "disconnect", "message" );

    console.log( "created socket" );

    var g = this.graph = userProvider.getSocialGraph();
    g.getFollowing( function( err, following ) {
      console.log( "got following", following );
      following.forEach( function( userId ) {
        console.log( userProvider.currentUserId, "joining", "user-" + userId, "channel" );
        io.join( "user-" + userId );
      } );
    } );

    io.on( "message", this.message );
    io.on( "disconnect", this.disconnect );

    this.io = io;
  }

  _.extend( Socket.prototype, {
    message: function( body ) {
      console.log( "got message", body );
    },
    disconnect: function() {
      SocketManager.socketClosed( this );
    }
  });

  core.broadcaster.on( "socket:emit", function( message ) {
    SocketManager.sendToRoom( "user-" + message.userId, message.body );
  });

  return SocketManager;
})();