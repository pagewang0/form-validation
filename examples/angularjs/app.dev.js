var Validator = require('../../dist/form-validation')

angular.module('app', [])
.controller('app_control', function ($scope, $timeout) {
    var arr = ['username', 'password', 'confirm', 'email', 'sex', 'phone']
    var props = {
        msg: '',
        style: 'form-control',
        parent: 'form-group row'
    }

    $scope.view_model = {}

    for (var i = 0; i < arr.length; i++) {
        $scope.view_model[arr[i]] = Object.assign({}, props)
    }

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

    $scope.app_submit = function ($event) {
        $event.preventDefault()
        validator.check()
    }

    $scope.username_change = function () {
        validator.check_one('username')
    }

    var request = window.superagent

    validator.path('username').message.set(function(err) {
        var username = $scope.view_model.username
        var item = validator.schema.username

        if (err) {
            $timeout(function () {
                username.style += ' form-control-warning'
                username.parent += ' has-warning'
                username.msg = item.msg
            })
        };
    }).reset(function() {
        var username = $scope.view_model.username

        $timeout(function () {
            username.style = username.style.replace(' form-control-warning', '')
            username.parent = username.parent.replace(' has-warning', '')
            username.msg = ''
        })
    })

    messages.set(function(err, field) {
        var item = validator.schema[field]
        var view_model = $scope.view_model

        if (err) {
            $timeout(function () {
                view_model[field].style += ' form-control-danger'
                view_model[field].parent += ' has-danger'
                view_model[field].msg = item.msg
            })
        } else {
            // set success style
        }
    }).reset(function(field) {
        var view_model = $scope.view_model

        $timeout(function () {
            view_model[field].style = view_model[field].style.replace(' form-control-danger', '')
            view_model[field].parent = view_model[field].parent.replace(' has-danger', '')
            view_model[field].msg = ''
        })
    })

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

    validator.get(function (field) {
        return $scope[field]
    })

    validator.path('username').get(function() {
        return $scope.username
    })

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

            $timeout(function () { // for test code
                $scope.view_model.code = res.status
            })
        })
    })
})