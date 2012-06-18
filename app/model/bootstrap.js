var Sequelize = require( "sequelize" ),
    _ = require( "underscore" ),
    core = require( "../core" ),
    redback = core.redback;

var db = new Sequelize( null, null, null, {
  dialect: "sqlite",
  storage: "db/db.sqlite"
});

const USERNAME_REGEX = /[@]+[A-Za-z0-9-_]+/g;
const HASH_TAG_REGEX = /[#]+[A-Za-z0-9-_]+/g;
const URL_REGEX = /[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g;

var User = db.define(
  "User", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    login: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  {
    paranoid: true,
    instanceMethods: {
      getSocialGraph: function() {
        if ( this.isNewRecord ) throw new Error( "Cannot create a social graph for an unsaved model" );
        return User.getSocialGraph( this.id );
      }
    },
    classMethods: {
      getSocialGraph: function( userId ) {
        if ( User.socialGraphs[ userId ] === undefined ) {
          User.socialGraphs[ userId ] = redback.createSocialGraph( userId, User.SOCIAL_GRAPH_KEY );
        }
        return User.socialGraphs[ userId ];
      }
    }
  }
);
User.SOCIAL_GRAPH_KEY = "twire_social_graph";
User.socialGraphs = {};

var Message = db.define(
  "Message", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    body: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    tags: Sequelize.TEXT,
    usernames: Sequelize.TEXT,
    links: Sequelize.TEXT,
    repostedMessageId: Sequelize.INTEGER
  },
  {
    paranoid: false,
    instanceMethods: {
      isRepost: function() {
        return this.repostedMessage === null;
      },
      compile: function() {
        this.compileTags();
        this.compileUsernames();
        this.compileLinks();
      },
      compileTags: function() {
        this.tags = this.getMatches( HASH_TAG_REGEX ).join( "," );
      },
      compileUsernames: function() {
        this.usernames = this.getMatches( USERNAME_REGEX ).join( "," );
      },
      compileLinks: function() {
        this.links = this.getMatches( URL_REGEX ).join( "," );
      },
      getMatches: function( regex ) {
        return this.body.match( HASH_TAG_REGEX ) || [];
      },
      repost: function( userId ) {
        var m = Message.build({
          body: this.body,
          userId: userId,
          tags: this.tags,
          repostedMessageId: this.repostedMessageId
        });
      }
    }
  }
);

/*
String.prototype.parseUsername = function() {
  return this.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
    var username = u.replace("@","")
    return u.link("http://twitter.com/"+username);
  });
};
String.prototype.parseURL = function() {
  return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
    return url.link(url);
  });
};
String.prototype.parseUsernameToLink = function() {
  return this.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
    var username = u.replace("@","")
    return u.link("http://twitter.com/"+username);
  });
};
String.prototype.parseHashtag = function() {
  return this.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
    var tag = t.replace("#","%23")
    return t.link("http://search.twitter.com/search?q="+tag);
  });
};
*/


Message
  .belongsTo( User, { as: "user", foreignKey: "userId" } )
  .hasOne( Message, { as: "repostedMessage", foreignKey: "repostedMessageId" } );

db.sync()
  .success( function() {
    core.broadcaster.emit( "db:loaded" );
  })
  .error( function( err ) {
    console.log( "Error syncing", err );
  });

module.exports = {
  db: db,
  User: User,
  Message: Message
};