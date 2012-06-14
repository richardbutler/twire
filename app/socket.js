module.exports = (function() {
  var sio, SocketManager, Socket, _;

  sio = require( "socket.io" );
  _ = require( "underscore" );

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
    }
  }

  Socket = function( io ) {
    _( this ).bindAll( "disconnect", "message" );

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

  return SocketManager;
})();