(function() {
    var validator = new Validator({
        username: {required: true, _length: {max: 11, min: 6}},
        password: {required: true, _length: {max: 11, min: 6}},
        confirm: {equal: 'password'},
        email: {required: true, type: 'email'},
        sex: {required: true, enum: ['男', '女', '保密']},
        phone: {required: true, type: Number, _length: 11},
    })

    validator.messages({
        username: {required: '用户名是必须的', _length: {max: '用户名长度超过最大值', min: '用户名长度小于最小值'}},
        password: {required: '密码是必须的', _length: {max: '密码长度超过最大值', min: '密码长度小于最小值'}},
        confirm: {equal: '确认密码必须和密码保持一致'},
        email: {required: 'email是必须的', type: 'email格式不正确'},
        sex: {required: '性别是必须的', enum: '性别输入值不在限定范围之内'},
        phone: {required: '手机号码是必须的', type: '手机号码值类型错误', _length: '手机号码长度必须为11'}
    })

    validator.bind('form')  // bind form id

    var request = superagent

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

    validator.path('username')._msg.set(function(err) {
        var username = validator.schema.username

        if (err) {
            $('#username').addClass('form-control-danger')
            $('#username').parent().parent().addClass('has-danger')
            $('#username').siblings('.form-control-feedback').text(username.msg)
        } else {
            // set success style
        }
    }).reset(function() {
            $('#username').removeClass('form-control-danger')
            $('#username').parent().parent().removeClass('has-danger')
            $('#username').siblings('.form-control-feedback').text('message')
    })
})()