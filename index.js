(function () {
    "use strict"
    function Validator (schema) {
        this.schema = schema
        this.fields = Object.keys(schema)
    }

    window.Validator = Validator

    Validator.prototype.submit = function (fn) {
        this.submit = fn
    }

    Validator.prototype.messages = function (messages) {
        var self = this
        this.messages = messages

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
            if (item._msg) {
                item._msg.reset()
            } else {
                messages.reset(field)
            }

            item.msg = ''
            item.err = false
        };
    }

    Validator.prototype.reset = function () {
        var item
        var schema = this.schema
        var messages = this.messages
        var field, fields = this.fields

        for (var i = 0; i < fields.length; i++) {
            field = fields[i] // field name
            item = schema[field]
            this.reset_one(item, field)
        }
    }

    Validator.prototype.path = function (field) {
        var item = this.schema[field]

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

    Validator.prototype.show_error = function (item, field) {
        var messages = this.messages

        if (item._msg) {
            item._msg.set(1)
        } else {
            messages.set(1, field)
        }
    }

    Validator.prototype.handle_error = function (field, type) {
        //console.log(field, type)
        var schema = this.schema
        var messages = this.messages
        var item = schema[field]

        item.err = true
        item.msg = messages[field][type]

        this.show_error(item, field)
    }

    Validator.prototype.check_one = function (field, all) {
        var schema = this.schema
        var messages = this.messages
        var item = schema[field]
        var handle_error = this.handle_error.bind(this)
        var show_error = this.show_error.bind(this)

        if (!all) {
            this.reset_one(item, field)
        }

        if (item.get) {
            item.value = item.get()
        } else {
            item.value = document.getElementById(field).value.trim()
        }

        if (item.value === undefined) {
            item.value = ''
        }

        var value = item.value

        if (item.required && value === '') {
            handle_error(field, 'required')
            return
        }

        if (item.length) {
            var length = item.length

            if (typeof(length) === 'object') {
                if (length.max && value.length > length.max) {
                    item.err = true
                    item.msg =  messages[field].length.max
                    show_error(item, field)
                    return
                }
                if (length.min && value.length < length.min) {
                    item.err = true
                    item.msg =  messages[field].length.min
                    show_error(item, field)
                    return
                }
            } else if (value.length !== length) {
                handle_error(field, 'length')
                return
            };
        }

        if (item.type) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

            if ((item.type === 'email' && !re.test(value)) || (item.type === Number && !Number(value))) {
                handle_error(field, 'type')
                return
            }
        }

        if (item.enum && !~item.enum.indexOf(value)) {
            handle_error(field, 'enum')
            return
        };

        if (item.equal) {
            var equal = item.equal
            var other = schema[equal].value

            if (value !== other) {
                handle_error(field, 'equal')
                return
            };
        };

        if (!all) {
            item.task.handle(field, value, function (err) {
                if (err) {
                    item.err = true
                    item.msg = item.task.msg
                    show_error(item, field)
                };
            })
        }
    }

    Validator.prototype.check = function() {
        var item, value
        var index = 0
        var submit = this.submit
        var schema = this.schema
        var messages = this.messages
        var field, fields = this.fields
        var handle_error = this.handle_error.bind(this)
        var show_error = this.show_error.bind(this)


        this.reset()

        for (var i = 0; i < fields.length; i++) {
            field = fields[i] // field name
            item = schema[field]
            this.check_one(field, true)
        }

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
            var item = schema[field]
            index++

            if (err) {
                item.err = true
                item.msg = item.task.msg
                show_error(item, field)
            };

            if (index === tasks.length || tasks.length === 0) {
                //console.log(schema)
                for (var i = 0; i < fields.length; i++) {
                    field = fields[i]

                    if (schema[field].err) {
                        error += schema[field].msg + '\r\n'
                    }
                };

                if (error) {
                    console.log(error)
                    //alert(error)
                } else {
                    submit()
                }
            };
        }

        if (tasks.length === 0) {
            return done()
        };

        for (var i = 0; i < tasks.length; i++) {
            field = tasks[i].field
            value = schema[field].value
            tasks[i].handle(field, value, done)
        };
    }
})()