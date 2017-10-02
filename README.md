## based on validate before form submit

####
<b>Inspired</b> by mongoose.Schema, achieve an <b>config type</b> form validation library
####
[中文说明](https://github.com/pagewang0/form-validation/blob/master/README_CN.md)

###
Feature:
* single input item validate (synchronous and asynchronous)
* based on validate before form submit
* provide field.get method get field value
* DIY validation method

```javascript
var validator = new Validator({
    username: {required: true, length: {max: 11, min: 6}},
    password: {required: true, length: {max: 11, min: 6}},
    confirm: {equal: 'password'},
    email: {required: true, type: 'email'},
    sex: {required: true, enum: ['男', '女', '保密']},
    phone: {required: true, type: Number, length: 11},
})

var messages = validator.messages({
    username: {required: '用户名是必须的', length: {max: '用户名长度超过最大值', min: '用户名长度小于最小值'}},
    password: {required: '密码是必须的', length: {max: '密码长度超过最大值', min: '密码长度小于最小值'}},
    confirm: {equal: '确认密码必须和密码保持一致'},
    email: {required: 'email是必须的', type: 'email格式不正确'},
    sex: {required: '性别是必须的', enum: '性别输入值不在限定范围之内'},
    phone: {required: '手机号码是必须的', type: '手机号码值类型错误', length: '手机号码长度必须为11'}
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
```

ps: I am english is poor,  please forgive...