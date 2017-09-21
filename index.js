(function () {
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

    Validator.prototype.reset = function () {
        var item
        var schema = this.schema
        var messages = this.messages
        var field, fields = this.fields

        for (var i = 0; i < fields.length; i++) {
            field = fields[i] // field name
            item = schema[field]

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

    Validator.prototype.check = function() {
        var item, value
        var index = 0
        var submit = this.submit
        var schema = this.schema
        var messages = this.messages
        var field, fields = this.fields

        function handleError(field, type) {
            //console.log(field, type)
            item = schema[field]
            item.err = true
            item.msg = messages[field][type]

            showError(item, field)
        }

        function showError (item, field) {
            if (item._msg) {
                item._msg.set(1)
            } else {
                messages.set(1, field)
            }
        }

        this.reset()

        for (var i = 0; i < fields.length; i++) {
            field = fields[i] // field name
            item = schema[field]

            if (item.get) {
                item.value = item.get()
            } else {
                item.value = document.getElementById(field).value.trim()
            }

            value = item.value

            if (item.required && value === '') {
                handleError(field, 'required')
                continue
            }

            if (item.length) {
                var length = item.length

                if (typeof(length) === 'object') {
                    if (length.max && value.length > length.max) {
                        item.err = true
                        item.msg =  messages[field].length.max
                        showError(item, field)
                        continue
                    }
                    if (length.min && value.length < length.min) {
                        item.err = true
                        item.msg =  messages[field].length.min
                        showError(item, field)
                        continue
                    }
                } else if (value.length !== length) {
                    handleError(field, 'length')
                    continue
                };
            }

            if (item.type) {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

                if ((item.type === 'email' && !re.test(value)) || (item.type === Number && !Number(value))) {
                    handleError(field, 'type')
                    continue
                }
            }

            if (item.enum && !~item.enum.indexOf(value)) {
                handleError(field, 'enum')
                continue
            };

            if (item.equal) {
                var equal = item.equal
                var other = schema[equal].value

                if (value !== other) {
                    handleError(field, 'equal')
                    continue
                };
            };
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
                showError(item, field)
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