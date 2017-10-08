var item = (name, doc, id, handle_change, handle_blur) => (
    <div className={doc.parent} key={id}>
        <label className="col-sm-2 col-form-label" htmlFor={name}>{name}</label>
        <div className="col-sm-10">
            <input type={ doc.type ? doc.type : 'text' } className={doc.style} id={name} name={name}
                value={doc.value}
                onChange={handle_change.bind(this, name)}
                onBlur={doc.blur ? handle_blur.bind(this) : null}
                />
            <div className="form-control-feedback">{doc.message}</div>
            <small className="form-text text-muted">{doc.help_info}</small>
        </div>
    </div>
)

var validation = (state, setState) => {
    var request = superagent

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

    validator.path('username')._msg.set(err => {
        var username = state.username
        var item = validator.schema.username

        if (err) {
            username.style += ' form-control-warning'
            username.parent += ' has-warning'
            username.message = item.msg
        }

        setState(state)
    }).reset(() => {
        var username = state.username

        username.style = username.style.replace(' form-control-warning', '')
        username.parent = username.parent.replace(' has-warning', '')
        username.message = ''

        setState(state)
    })

    messages.set((err, field) => {
        var item = validator.schema[field]

        if (err) {
            state[field].style += ' form-control-danger'
            state[field].parent += ' has-danger'
            state[field].message = item.msg
        } else {
            // set success style
        }

        setState(state)
    }).reset(field => {
        state[field].style = state[field].style.replace(' form-control-danger', '')
        state[field].parent = state[field].parent.replace(' has-danger', '')
        state[field].message = ''

        setState(state)
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

    validator.get(function (field) {
        return state[field].value
    })

    validator.path('username').get(function() {
        return state.username.value
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

            state.code = res.status
            setState(state) // for test code
        })
    })

    return validator
}

class App extends React.Component {
    constructor(props) {
        super(props)

        this.handle_change = this.handle_change.bind(this)
        this.handle_submit = this.handle_submit.bind(this)
        this.handle_blur = this.handle_blur.bind(this)

        this.fields = ['username', 'password', 'confirm', 'email', 'sex', 'phone']
        this.styles = {
            value: '',
            message: '',
            style: 'form-control',
            parent: 'form-group row'
        }

        this.state = {
            username: {
                blur: true,
                help_info: '输入用户名位数在6-11之间 且未被注册过'
            },
            password: {
                type: 'password',
                help_info: '输入密码位数在6-11之间'
            },
            confirm: {
                type: 'password',
                help_info: '需要与密码保持一致'
            },
            email: {
                help_info: '必须为email格式'
            },
            sex: {
                help_info: '输入值必须为: 男或女或保密'
            },
            phone: {
                help_info: '必须为11位数的手机号 且未被注册过'
            }
        }

        var field, fields = this.fields
        var state = this.state
        var styles = this.styles

        for (var i = 0; i < fields.length; i++) {
            field = fields[i]
            state[field] = Object.assign({}, styles, state[field])
        }

        var state = this.state
        var setState = this.setState.bind(this)

        this.validator = validation(state, setState)
    }

    handle_change(field, e) {
        var state = this.state

        state[field].value = e.target.value
        this.setState(state)
    }

    handle_submit(e) {
        e.preventDefault()
        this.validator.check()
    }

    handle_blur() {
        this.validator.check_one('username')
    }

    render() {
        var self = this
        var fields = this.fields
        var state = this.state
        var handle_change = this.handle_change
        var handle_submit = this.handle_submit
        var handle_blur = this.handle_blur

        return (
            <div className="container">
                <form onSubmit={handle_submit}>

                    {
                        fields.map((field, index) => item(fields[index], state[field], index, handle_change, handle_blur))
                    }

                    <div className="form-group row">
                        <div className="btn-wrap">
                            <button type="submit" className="btn btn-primary pull-right" id="submit" data-code={state.code}>Submit</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);