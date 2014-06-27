var util = require('util');
var gearsloth = require('gearsloth');

/**
 * Passthrough component. Emits 'connect' when at least one server for both
 * worker and client roles are connected to.
 */

function Passthrough(conf) {
  gearsloth.Component.call(this, 'controller', conf);
  var that = this;
  this.registerGearman(conf.servers, {
    client: true,
    worker: {
      func_name: 'passthroughController',
      func: function(payload, worker) {
        var task = JSON.parse(payload.toString());
        that.workHandler(task, worker);
      });
    }
  });
}

util.inherits(Passthrough, gearsloth.Component);

Passthrough.prototype.workHandler = function(task, worker) {
  var that = this;
  worker.complete();

  // TODO: Properly abstract this to gearsloth library
  if ('payload_base64' in task)
    task.payload = new Buffer(task.payload_base64, 'base64');
  if ('func_name_base64' in task)
    task.func_name = new Buffer(task.func_name_base64, 'base64');

  this._client.submitJob(task.func_name, task.payload)
    .on('complete', function() {
      that._client.submitJob('delayedJobDone', JSON.stringify({
        id: task.id
      }));
    });
};

module.exports = function(conf) {
  return new Passthrough(conf);
};
module.exports.Passthrough = Passthrough;
