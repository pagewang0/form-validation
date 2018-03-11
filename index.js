'use strict';
function Validator (schema) {
  this._messages = {};
  this.schema = schema;
  this.fields = Object.keys(schema);
  this.transform(this.schema);

  this.map = {
    required: 'return v === ""',
    length: 'return v.length !== cond',
    max_length: 'return v.length > cond',
    min_length: 'return v.length < cond',
    type: 'return (cond === Number && isNaN((+v))) || (cond !== Number && v.constructor !== cond)',
    enum: 'return !~cond.indexOf(v)',
    equal: 'return typeof cond === "function" ? v !== cond() : v !== document.getElementById(cond).value',
    regex: 'return typeof cond === "function" ? !cond(v) : !cond.test(v)'
  };

  this.props = Object.keys(this.map);

  for (var k in this.map) {
    this.map[k] = new Function('v', 'cond', this.map[k]);
  }

  ['submit', 'get_errors'].forEach(function (v) {
    Validator.prototype[v] = new Function('cb', 'this._' + v + ' = cb');
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
  var self = this;

  this._messages.opts = opts;
  this.transform(this._messages.opts);

  var o = {
    set: function (cb) {
      self._messages.set = cb;
      return this;
    },
    reset: function (cb) {
      self._messages.reset = cb;
      return this;
    }
  };

  return o;
};

Validator.prototype.reset_one = function (item, field) {
  if (item.err) {
    item.err = null;
    item.msg ? item.msg.reset() : this._messages.reset(field);
  }
};

Validator.prototype.path = function (field) {
  var item = this.schema[field];
  var path = {
    get: function (cb) {
      item.get = cb;
      return this;
    },
    validate: function (cb) {
      item.cb = cb;
      return this;
    },
    message: {
      set: function (cb) {
        item.msg = item.msg || {};
        item.msg.set = cb;
        return this;
      },
      reset: function (cb) {
        item.msg = item.msg || {};
        item.msg.reset = cb;
        return this;
      }
    }
  };

  return path;
};

Validator.prototype.show_error = function (item, field) {
  item.err && item.msg ? item.msg.set(item.err) : this._messages.set(item.err, field);
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
  : item.value = document.getElementById(field).value;

  for (var i = 0; i < this.props.length; i++) {
    var prop = this.props[i];
    if (item[prop] && this.map[prop](item.value, item[prop])) {
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

      !flag && self._get_errors && self._get_errors(errors);
      flag && self._submit();
    }
  }

  tasks.forEach(function (task) {
    task.cb(done.bind(task));
  });

  tasks.length === 0 && done();
};