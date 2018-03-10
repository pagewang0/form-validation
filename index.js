'use strict';
function Validator (schema) {
  this.schema = schema;
  this.fields = Object.keys(schema);
  this.props = ['required', 'length', 'type', 'enum', 'min_length', 'max_length'];

  this.transform(this.schema);

  ['submit', 'get_errors', 'get'].forEach(function (v) {
    Validator.prototype[v] = new Function('fn', 'this._' + v + ' = fn');
  });
}

Validator.prototype.transform = function (opts) {
  this.fields.forEach(function (k) {
    if (opts[k].length && opts[k].length.constructor === Object) {
      if (opts[k].length.min) {
        opts[k]['min_length'] = opts[k].length.min;
      }

      if (opts[k].length.max) {
        opts[k]['max_length'] = opts[k].length.max;
      }
      delete opts[k].length;
    }
  });
};

Validator.prototype.messages = function (opts) {
  var o = {};
  var self = this;

  if (!this._messages) {
    this._messages = {
      opts: opts
    };

    this.transform(this._messages.opts);
  }

  ['set', 'reset'].forEach(function (k) {
    o[k] = function (cb) {
      self._messages[k] = cb;
      return this;
    };
  });

  return o;
};

Validator.prototype.reset_one = function (item, field) {
  if (item.err) {
    item.err = null;
    item._msg ? item._msg.reset() : this._messages.reset(field);
  }
};

Validator.prototype.path = function (field) {
  var item = this.schema[field];
  var path = {
    get: function (cb) {
      item.get = cb;
    },
    validate: function (cb) {
      item.cb = cb;
    }
  };

  ['set', 'reset'].forEach(function (k) {
    if (!path.message) {
      path.message = {};
    }

    path.message[k] = function (cb) {
      item._msg = item._msg || {};
      item._msg[k] = cb;

      return path.message;
    };
  });

  return path;
};

Validator.prototype.show_error = function (item, field) {
  item.err && item._msg ? item._msg.set(true) : this._messages.set(true, field);
};

Validator.prototype.handle_error = function (field, type) {
  var item = this.schema[field];

  item.err = this._messages.opts[field][type];
  this.show_error(item, field);
};

Validator.prototype.check_one = function (field, all) {
  var item = this.schema[field];
  var show_error = this.show_error.bind(this);

  this.reset_one(item, field);

  item.get ? item.value = item.get()
  : this._get ? item.value = this._get(field)
  : item.value = document.getElementById(field).value;

  item.value = item.value || '';

  var map = {
    required: function (v) {
      return v === '';
    },
    length: function (v, cond) {
      return v.length !== cond;
    },
    max_length: function (v, cond) {
      return v.length > cond;
    },
    min_length: function (v, cond) {
      return v.length < cond;
    },
    type: function (v, cond) {
      return (cond === Number && isNaN((+v)))
        || (cond !== Number && v.constructor !== cond);
    },
    enum: function (v, cond) {
      return !~cond.indexOf(v);
    }
  };

  for (var i = 0; i < this.props.length; i++) {
    var prop = this.props[i];
    if (item[prop] && map[prop](item.value, item[prop])) {
      return this.handle_error(field, prop);
    }
  }

  if (!all && item.cb) {
    item.cb(function (err) {
      if (err) {
        item.err = err;
        show_error(item, field);
      }
    });
  }
};

Validator.prototype.check = function() {
  var count = 0;
  var tasks = [];
  var flag = true;
  var self = this;
  var show_error = this.show_error.bind(this);

  this.fields.forEach(function (field) {
    var item = self.schema[field];

    self.check_one(field, true);

    if (!item.err && item.cb) {
      tasks.push({ cb: item.cb, field: field, value: item.value });
    }
  });

  function done(err) {
    if (err) {
      var item = self.schema[this.field];
      item.err = err;
      show_error(item, this.field);
    }

    count++;

    if (tasks.length === 0 || tasks.length === count) {
      var errors = {};

      self.fields.forEach(function (field) {
        var item = self.schema[field];

        if (item.err) {
          flag = false;
          errors[field] = item.err;
        }
      });

      self._get_errors && self._get_errors(errors);
      flag && self._submit();
    }
  }

  tasks.forEach(function (task) {
    task.cb(done.bind(task));
  });

  tasks.length === 0 && done();
};