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
        var userId = userProvider.currentUserId,
            sock = new Socket( socket, userId );

        console.log( "socket connected", userId );

        if ( self.socketsByUserId[ userId ] !== undefined ) {
          throw new Error( "Attempting to create duplicate socket for user ID " + userId );
        }

        self.sockets.push( sock );
        self.socketsByUserId[ userId ] = sock;
      });

      this.io = io;
      this.sockets = [];
      this.socketsByUserId = {};
    },
    socketClosed: function( socket ) {
      console.log( "socket closed", socket.userId );
      this.sockets = _( this.sockets ).without( socket );
      delete this.socketsByUserId[ socket.userId ];
    },
    socketForUser: function( userId ) {
      if ( this.socketsByUserId[ userId ] === undefined ) {
        throw new Error( "No socket for user id " + userId );
      }
      return this.socketsByUserId[ userId ];
    },
    sendToRoom: function( room, event, message ) {
      var room = "user-" + userId;
      console.log( "emitting message", room, event, message );
      this.io.sockets.in( room ).emit( event, message );
    },
    sendToUserRoom: function( userId, event, message ) {
      var room = "user-" + userId;
      console.log( "emitting message", room, event, message );
      this.io.sockets.in( room ).emit( event, message );
    }
  }

  Socket = function( io, userId ) {
    _( this ).bindAll( "disconnect", "message", "joinRoomForUser", "leaveRoomForUser" );

    console.log( "created socket", userId );

    var g = this.graph = userProvider.getSocialGraph(),
        self = this,
        userRoom = "user-" + userId;

    g.getFollowing( function( err, following ) {
      console.log( "got following", following );
      following.forEach( self.joinRoomForUser );
    } );

    io.join( userRoom )
      .on( "message", this.message )
      .on( "disconnect", this.disconnect )
      .on( "follow", this.joinRoomForUser )
      .on( "unfollow", this.leaveRoomForUser );

    this.userId = userId;
    this.userRoom = userRoom;
    this.io = io;
  }

  _.extend( Socket.prototype, {
    message: function( body ) {
      console.log( "got message", body );
    },
    disconnect: function() {
      SocketManager.socketClosed( this );
    },
    joinRoomForUser: function( userId ) {
      console.log( userProvider.currentUserId, "joining", "user-" + userId, "channel" );
      this.io.join( "user-" + userId );
    },
    leaveRoomForUser: function( userId ) {
      console.log( userProvider.currentUserId, "leaving", "user-" + userId, "channel" );
      this.io.leave( "user-" + userId );
    }
  });

  core.broadcaster.on( "socket:emit", function( message ) {
    SocketManager.sendToUserRoom( message.userId, "message", message.body );
  });
  core.broadcaster.on( "user:follow", function( userId ) {
    SocketManager.sendToUserRoom( userProvider.currentUserId, "follow", userId );
  });
  core.broadcaster.on( "user:unfollow", function( userId ) {
    SocketManager.sendToUserRoom( userProvider.currentUserId, "unfollow", userId );
  });

  return SocketManager;
})();