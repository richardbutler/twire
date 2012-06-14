var Sequelize = require( "sequelize" );
var _ = require( "underscore" );

var db = new Sequelize( null, null, null, {
  dialect: "sqlite",
  storage: "db/db.sqlite"
});
var tableOptions = {
  paranoid: false,
  underscored: false
};

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
  tableOptions
);

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
    repostedMessageId: Sequelize.INTEGER
  },
  _.extend( {
    instanceMethods: {
      isRepost: function() {
        return this.repostedMessage === null;
      },
      compileTags: function() {
        var message = this.body;
        var tags = message.match( HASH_TAG_REGEX );
        this.tags = tags.join( "," );
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
  }, tableOptions )
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

db.sync().error( function( err ) {
  console.log( "Error syncing", err );
});

module.exports = {
  db: db,
  User: User,
  Message: Message
};