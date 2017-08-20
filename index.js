function Validator (schema) {
    this.schema = schema
}

Validator.prototype.messages = function (messages) {
    this.messages = messages
}

Validator.prototype.reset = function () {
    var item
    var schema = this.schema
    var field, fields = Object.keys(schema)
    var prop, props = ['required', '_length', 'type', 'enum', 'equal']

    for (var i = 0; i < fields.length; i++) {
        field = fields[i] // field name
        item = schema[field]

        if (item.err) {
            if (item._msg) {
                item._msg.reset()
            };

            item.msg = ''
            item.err = false
        };
    }
}

Validator.prototype.path = function (field) {
    var self = this
    var item = self.schema[field]

    return {
        validate: function (fn, msg) {
            item.task = {handle: fn, msg: msg, field: field}
        },
        get: function(fn) { // get field value
            item.get = fn
        },
        _msg: {
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

Validator.prototype.bind = function(id) {
    var self = this
    var element = document.getElementById(id)

    element.addEventListener('submit', function(e) {
        e.preventDefault()

        self.check()
    }, false)
}

Validator.prototype.check = function() {
    var item
    var index = 0
    var schema = this.schema
    var messages = this.messages
    var field, fields = Object.keys(schema)
    var prop, props = ['required', '_length', 'type', 'enum', 'equal']

    function handleError(field, type) {
        console.log(field, type)
        item = schema[field]
        item.err = true
        item.msg = messages[field][type]

        showError(item)
    }

    function showError (item) {
        if (item._msg && item.err) {
            item._msg.set(1)
        };
    }

    this.reset()

    for (var i = 0; i < fields.length; i++) {
        field = fields[i]
        item = schema[field]

        if (item.get) {
            item.value = item.get()
        } else {
            item.value = document.getElementById(field).value.trim()
        }
    };

    for (var i = 0; i < fields.length; i++) {
        field = fields[i] // field name

        for (var j = 0; j < props.length; j++) {
            prop = props[j]
            item = schema[field]
            value = item.value

            if (item.required && prop === 'required' && value === '') {
                handleError(field, prop)
                break
            };

            if (item._length && prop === '_length') {
                var length = item[prop]

                if (typeof(length) === 'object') {
                    if (length.max && value.length > length.max) {
                        item.err = true
                        item.msg =  messages[field]._length.max
                        showError(item)
                        break
                    }
                    if (length.min && value.length < length.min) {
                        item.err = true
                        item.msg =  messages[field]._length.min
                        showError(item)
                        break
                    }
                } else if (value.length !== length) {
                    handleError(field, prop)
                    break
                };
            };

            if (item.type && prop === 'type') {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

                if (item.type === 'email' && !re.test(value)) {
                    handleError(field, prop)
                    break
                } else if (item.type === Number && !Number(value)) {
                    handleError(field, prop)
                    break
                }
            };

            if (item.enum && prop === 'enum') {
                var _enum = item.enum

                if (!~_enum.indexOf(value)) {
                    handleError(field, prop)
                    break
                };
            };

            if (item.equal && prop === 'equal') {
                var equal = item.equal
                var other = schema[equal].value

                if (value !== other) {
                    handleError(field, prop)
                    break
                };
            };
        };
    };

    var tasks = []

    for (var i = 0; i < fields.length; i++) {
        field = fields[i]
        item = schema[field]

        if (!item.err && item.task) {
            tasks.push(item.task)
        };
    };

    function done(err, field) {
        var error = ''
        item = schema[field]
//        console.log(schema)
        index++
//        console.log(index)
        if (err) {
            item.err = true
            item.msg = item.task.msg
            showError(item)
        };

        if (index === tasks.length || tasks.length === 0) {
            // async task done
            console.log('done')
            console.log(schema)
            for (var i = 0; i < fields.length; i++) {
                field = fields[i]

                if (item.err) {
                    error += item.msg + '\r\n'
                };
            };

            if (error) {
                alert(error)
            } else {
                alert('submit action')
            }
        };
    }

    if (tasks.length === 0) {
        done()
    };

    for (var i = 0; i < tasks.length; i++) {
        field = tasks[i].field
        value = schema[field].value
        tasks[i].handle(field, value, done)
    };
}