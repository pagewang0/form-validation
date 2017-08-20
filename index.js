function Validator (schema) {
    this.schema = schema
}

Validator.prototype.messages = function (messages) {
    this.messages = messages
}

Validator.prototype.reset = function () {
    var schema = this.schema
    var field, fields = Object.keys(schema)
    var prop, props = ['required', '_length', 'type', 'enum', 'equal']

    for (var i = 0; i < fields.length; i++) {
        field = fields[i] // field name
        schema[field].err = true

        if (schema[field].err) {
            schema[field].msg = ''
            schema[field].err = false
        };
    }
}

Validator.prototype.path = function (field) {
    var self = this
    var item = self.schema[field]

    return {
        validate: function (fn, msg) {
            item.stack = {handle: fn, msg: msg, field: field}
        },
        get: function(fn) { // get field value
            item.get = fn
        },
        _msg: function(fn) { // set msg
            // init fail success loading
            item._msg = fn
        },
        reset: function(fn) {
            item.reset = fn
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
    var index = 0
    var schema = this.schema
    var messages = this.messages
    var field, fields = Object.keys(schema)
    var prop, props = ['required', '_length', 'type', 'enum', 'equal']

    function handleError(field, type) {
        console.log(field, type)
        schema[field].err = true
        schema[field].msg = messages[field][type]
    }

    this.reset()

    for (var i = 0; i < fields.length; i++) {
        field = fields[i]
        schema[field].value = document.getElementById(field).value.trim()
    };

    for (var i = 0; i < fields.length; i++) {
        field = fields[i] // field name

        for (var j = 0; j < props.length; j++) {
            prop = props[j]
            var value = schema[field].value

            if (schema[field].required && prop === 'required' && value === '') {
                handleError(field, prop)
                break
            };

            if (schema[field]._length && prop === '_length') {
                var length = schema[field][prop]

                if (typeof(length) === 'object') {
                    if (length.max && value.length > length.max) {
                        schema[field].err = true
                        schema[field].msg =  messages[field]._length.max
                        break
                    }
                    if (length.min && value.length < length.min) {
                        schema[field].err = true
                        schema[field].msg =  messages[field]._length.min
                        break
                    }
                } else if (value.length !== length) {
                    handleError(field, prop)
                    break
                };
            };

            if (schema[field].type && prop === 'type') {
                var type = schema[field].type
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

                if (type === 'email' && !re.test(value)) {
                    handleError(field, prop)
                    break
                } else if (type === Number && !Number(value)) {
                    handleError(field, prop)
                    break
                }
            };

            if (schema[field].enum && prop === 'enum') {
                var _enum = schema[field].enum

                if (!~_enum.indexOf(value)) {
                    handleError(field, prop)
                    break
                };
            };

            if (schema[field].equal && prop === 'equal') {
                var equal = schema[field].equal
                var other = schema[equal].value

                if (value !== other) {
                    handleError(field, prop)
                    break
                };
            };
        };
    };

    var item
    var stack = []

    for (var i = 0; i < fields.length; i++) {
        field = fields[i]
        item = schema[field]

        if (!item.err && item.stack) {
            stack.push(schema[field].stack)
        };
    };

    function done(err, field) {
        var error = ''
//        console.log(schema)
        index++
//        console.log(index)
        if (err) {
            schema[field].err = true
            schema[field].msg = schema[field].stack.msg
        };

        if (index === stack.length || stack.length === 0) {
            // async task done
            console.log('done')
            console.log(schema)
            for (var i = 0; i < fields.length; i++) {
                field = fields[i]

                if (schema[field].err) {
                    error += schema[field].msg + '\r\n'
                };
            };

            if (error) {
                alert(error)
            };
        };
    }

    if (stack.length === 0) {
        done()
    };

    for (var i = stack.length - 1; i >= 0; i--) {
        field = stack[i].field
        value = schema[field].value
        stack[i].handle(field, value, done)
    };
}