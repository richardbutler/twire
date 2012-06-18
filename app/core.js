var redback = require( "redback" ).createClient(),
    events = require( "events" ),
    $ = require( "zepto-node" ),
    Deferred = require( "simply-deferred" );

Deferred.installInto( $ );

module.exports = {
  redback: redback,
  broadcaster: new events.EventEmitter()
}