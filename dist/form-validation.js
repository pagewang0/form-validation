(function (root, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
  (root.Validator = factory());
}(this, function () {
  "use strict"
  function Validator (schema) {
    this.schema = schema
    this.fields = Object.keys(schema)
    this.props = ['required', 'length', 'type', 'enum']
  
    var name, names = ['submit', 'get_errors', 'get']
  
    for (var i = 0; i < names.length; i++) {
      name = names[i]
      Validator.prototype[name] = new Function('fn', 'this._' + name + ' = fn')
    }
  }
  
  Validator.prototype.messages = function (messages) {
    var self = this
    this._messages = messages
  
    return {
      set: function(fn) {
        self.messages.set = fn
        return this
      },
      reset: function(fn) {
        self.messages.reset = fn
        return this
      }
    }
  }
  
  Validator.prototype.reset_one = function (item, field) {
    var messages = this.messages
  
    if (item.err) {
      item._msg ? item._msg.reset() : messages.reset(field)
      item.msg = ''
      item.err = false
    }
  }
  
  Validator.prototype.path = function (field) {
    var item = this.schema[field]
  
    return {
      validate: function (fn) {
        item.task = {
          handle: fn,
          field: field
        }
      },
      get: function(fn) {
        item.get = fn
      },
      message: {
        set: function (fn) {
          if (!item._msg) {
            item._msg = {}
          };
  
          item._msg.set = fn
          return this
        },
        reset: function (fn) {
          if (!item._msg) {
            item._msg = {}
          };
  
          item._msg.reset = fn
          return this
        }
      }
    }
  }
  
  Validator.prototype.show_error = function (item, field) {
    var messages = this.messages
  
    if (item._msg) {
      item._msg.set(true)
    } else {
      messages.set(true, field)
    }
  }
  
  Validator.prototype.handle_error = function (field, type) {
    var schema = this.schema
    var messages = this._messages
    var item = schema[field]
  
    item.err = true
    item.msg = messages[field][type]
  
    this.show_error(item, field)
  }
  
  Validator.prototype.check_one = function (field, all) {
    var schema = this.schema
    var prop, props = this.props
    var messages = this._messages
    var item = schema[field]
    var handle_error = this.handle_error.bind(this)
    var show_error = this.show_error.bind(this)
  
    this.reset_one(item, field)
  
    if (item.get) {
      item.value = item.get()
    } else {
      this._get
      ? item.value = this._get(field)
      : item.value = document.getElementById(field).value
    }
  
    if (item.value === undefined) {
      item.value = ''
    }
  
    var value = item.value
    var length
  
    for (var i = 0; i < props.length; i++) {
      prop = props[i]
  
      if (item[prop]) {
        switch (prop) {
          case 'required':
            if (value === '') {
              handle_error(field, prop)
              return
            }
            break;
          case 'length':
            length = item.length
  
            if (typeof(length) === 'object') {
              if (length.max && value.length > length.max) {
                item.err = true
                item.msg =  messages[field].length.max
                show_error(item, field)
                return
              } else if (length.min && value.length < length.min) {
                item.err = true
                item.msg =  messages[field].length.min
                show_error(item, field)
                return
              }
            } else if (value.length !== length) {
              handle_error(field, prop)
              return
            };
            break;
          case 'type':
            if (item.type === Number && !Number(value)) {
              handle_error(field, prop)
              return
            }
            break;
          case 'enum':
            if (!~item.enum.indexOf(value)) {
              handle_error(field, prop)
              return
            }
            break;
        }
      }
    }
  
    if (!all && item.task) {
      item.task.handle(field, value, function (err) {
        if (err) {
          item.err = true
          item.msg = err
          show_error(item, field)
        };
      })
    }
  }
  
  Validator.prototype.check = function() {
    var item, value, i
    var index = 0
    var self = this
    var schema = this.schema
    var field, fields = this.fields
    var show_error = this.show_error.bind(this)
  
    for (i = 0; i < fields.length; i++) {
      field = fields[i]
      this.check_one(field, true)
    }
  
    var tasks = []
  
    for (i = 0; i < fields.length; i++) {
      field = fields[i]
      item = schema[field]
  
      if (!item.err && item.task) {
        tasks.push(item.task)
      };
    };
  
    function done(err, field) {
      var error = {}
      var flag = false
      var item = schema[field]
  
      index++
  
      if (err) {
        item.err = true
        item.msg = err
        show_error(item, field)
      };
  
      if (index === tasks.length || tasks.length === 0) {
        for (i = 0; i < fields.length; i++) {
          field = fields[i]
          item = schema[field]
  
          if (item.err) {
            error[field] = item.msg
  
            if (!flag) {
              flag = true
            }
          }
        };
  
        if (self._get_errors) {
          self._get_errors(error)
        }
  
        !flag && self._submit()
      };
    }
  
      if (tasks.length === 0) {
        return done()
      };
  
      for (i = 0; i < tasks.length; i++) {
        field = tasks[i].field
        value = schema[field].value
        tasks[i].handle(field, value, done)
      };
  }
  return Validator
}))