(function() {
    var Validator = window.Validator

    var validator = new Validator({
        username: {required: true, length: {max: 11, min: 6}},
        password: {required: true, length: {max: 11, min: 6}},
        confirm: {required: true},
        email: {required: true},
        sex: {required: true, enum: ['男', '女', '保密']},
        phone: {required: true, type: Number, length: 11},
    })

    var messages = validator.messages({
        username: {required: '用户名是必须的', length: {max: '用户名长度超过11', min: '用户名长度小于6'}},
        password: {required: '密码是必须的', length: {max: '密码长度超过11', min: '密码长度小于6'}},
        confirm: {required: '确认密码是必须的'},
        email: {required: 'email是必须的'},
        sex: {required: '性别是必须的', enum: '性别输入值不在限定范围之内'},
        phone: {required: '手机号码是必须的', type: '手机号码值类型错误', length: '手机号码长度必须为11'}
    })

    validator.path('username').get(function() {
        return document.getElementById('username').value
    })

    validator.get(function (field) {
        return document.getElementById(field).value
    })

    var request = window.superagent // superagent lib
    var form = document.getElementById('form')

    validator.path('username').validate(function (field, username, done) {
        request('/username')
        .query({username: username})
        .end((err, res) => {
            var error = '用户名已存在'

            if (err) {
                done(error, field)
                return
            };

            done()
        })
    })

    validator.path('phone').validate(function (field, phone, done) {
        request('/phone')
        .query({phone: phone})
        .end((err, res) => {
            var error = '手机号已存在'

            if (err) {
                done(error, field)
                return
            };

            done()
        })
    })

    validator.path('confirm').validate(function (field, confirm, done) {
        var password = validator.schema.password.value
        var error = '确认密码必须和密码保持一致'

        if (password !== confirm) {
            return done(error, field)
        }

        done()
    })

    validator.path('email').validate(function (field, email, done) {
        var error = 'email格式不正确'
        var _validator = window.validator // validator.js lib

        if (!_validator.isEmail(email)) {
            return done(error, field)
        }

        done()
    })

    document.getElementById('username').addEventListener('blur', function () {
        validator.check_one('username')
    }, false)

    var handle_submit = function (event) {
        event.preventDefault()
        validator.check()
    }

    form.addEventListener('submit', handle_submit, false)

    validator.submit(function() {
        form.removeEventListener('submit', handle_submit, false)
        document.getElementById('submit').click()
    })

    validator.get_errors(function (messages) {
        console.log(messages)
    })

    messages.set(function(err, field) {
        var item = validator.schema[field]
        var element = $('#' + field)

        if (err) {
            element.addClass('form-control-danger')
            element.parent().parent().addClass('has-danger')
            element.siblings('.form-control-feedback').text(item.msg)
        }
    }).reset(function(field) {
        var element = $('#' + field)

        element.removeClass('form-control-danger')
        element.parent().parent().removeClass('has-danger')
        element.siblings('.form-control-feedback').text('message')
    })

    validator.path('username').message.set(function(err) {
        var item = validator.schema.username
        var element = $('#username')

        if (err) {
            element.addClass('form-control-warning')
            element.parent().parent().addClass('has-warning')
            element.siblings('.form-control-feedback').text(item.msg)
        };
    }).reset(function() {
        var element = $('#username')

        element.removeClass('form-control-warning')
        element.parent().parent().removeClass('has-warning')
        element.siblings('.form-control-feedback').text('message')
    })
})()