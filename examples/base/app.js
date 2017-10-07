(function() {
    var validator = new Validator({
        username: {required: true, length: {max: 11, min: 6}},
        password: {required: true, length: {max: 11, min: 6}},
        confirm: {equal: 'password'},
        email: {required: true, type: 'email'},
        sex: {required: true, enum: ['男', '女', '保密']},
        phone: {required: true, type: Number, length: 11},
    })

    var messages = validator.messages({
        username: {required: '用户名是必须的', length: {max: '用户名长度超过11', min: '用户名长度小于6'}},
        password: {required: '密码是必须的', length: {max: '密码长度超过11', min: '密码长度小于6'}},
        confirm: {equal: '确认密码必须和密码保持一致'},
        email: {required: 'email是必须的', type: 'email格式不正确'},
        sex: {required: '性别是必须的', enum: '性别输入值不在限定范围之内'},
        phone: {required: '手机号码是必须的', type: '手机号码值类型错误', length: '手机号码长度必须为11'}
    })

    var request = superagent
    var username = document.getElementById('username')

    username.addEventListener('blur', function () {
        validator.check_one('username')
    }, false)

    document.getElementById('form').addEventListener('submit', function (event) {
        event.preventDefault()
        validator.check()
    }, false)

    validator.submit(function() {
        var schema = validator.schema
        var user = {
            username: schema.username.value,
            password: schema.password.value,
            confirm: schema.confirm.value,
            email: schema.email.value,
            sex: schema.sex.value,
            phone: schema.phone.value
        }

        request.post('/user')
        .send({user: user})
        .end((err, res) => {
            if (err) {
                console.log(err)
                return
            };

            $('#submit').data('code', res.status) // for test code
        })
    })

    messages.set(function(err, field) {
        var item = validator.schema[field]
        var element = $('#' + field)

        if (err) {
            element.addClass('form-control-danger')
            element.parent().parent().addClass('has-danger')
            element.siblings('.form-control-feedback').text(item.msg)
        } else {
            // set success style
            // element.addClass('form-control-success')
            // element.parent().parent().addClass('has-success')
            // element.siblings('.form-control-feedback').text('')
        }
    }).reset(function(field) {
        var element = $('#' + field)

        element.removeClass('form-control-danger')
        element.parent().parent().removeClass('has-danger')
        element.siblings('.form-control-feedback').text('message')
    })

    validator.path('username')._msg.set(function(err) {
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

    validator.path('username').validate(function(field, username, done) {
        request('/username')
        .query({username: username})
        .end((err, res) => {
            if (err) {
                done(err, field)
                return
            };
            done()
        })
    }, '用户名已存在')

    validator.path('phone').validate(function(field, phone, done) {
        request('/phone')
        .query({phone: phone})
        .end((err, res) => {
            if (err) {
                done(err, field)
                return
            };
            done()
        })
    }, '手机号已存在')

    validator.path('username').get(function() {
        return document.getElementById('username').value.trim()
    })
})()