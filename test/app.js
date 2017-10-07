describe('check feature', () => {
    it('show error msg', done => {
        var element = $('#username')
        var btn = $('#submit')

        btn.click()

        assert.equal(element.hasClass('form-control-warning'), true)
        assert.equal(element.parent().parent().hasClass('has-warning'), true)
        assert.equal(element.siblings('.form-control-feedback').text(), '用户名是必须的')

        element.val('1234')

        btn.click()
        assert.equal(element.siblings('.form-control-feedback').text(), '用户名长度小于6')

        element.val('183113099011')

        btn.click()
        assert.equal(element.siblings('.form-control-feedback').text(), '用户名长度超过11')


        element = $('#confirm')
        element.val('111')

        btn.click()
        assert.equal(element.hasClass('form-control-danger'), true)
        assert.equal(element.parent().parent().hasClass('has-danger'), true)
        assert.equal(element.siblings('.form-control-feedback').text(), '确认密码必须和密码保持一致')


        element = $('#email')
        element.val('123')

        btn.click()
        assert.equal(element.siblings('.form-control-feedback').text(), 'email格式不正确')

        element = $('#sex')
        element.val('123')

        btn.click()
        assert.equal(element.siblings('.form-control-feedback').text(), '性别输入值不在限定范围之内')

        element = $('#phone')
        element.val('123')

        btn.click()
        assert.equal(element.siblings('.form-control-feedback').text(), '手机号码长度必须为11')

        element.val('1831130990a')
        btn.click()
        assert.equal(element.siblings('.form-control-feedback').text(), '手机号码值类型错误')
        done()
    })

    it('check one input item and show error msg', function (done) {
        var username = $('#username')

        username.val('')

        username.focus()
        var password = $('#password')
        password.focus()
        assert.equal(username.siblings('.form-control-feedback').text(), '用户名是必须的')

        username.focus()
        username.val('12345678910')
        password.focus()

        this.timeout(5000)

        setTimeout(() => {
            assert.equal(username.siblings('.form-control-feedback').text(), '用户名已存在')
            done()
        }, 1000)
    })


    it('show async error msg', function (done) {
        var element = $('#username')
        var username = '12345678910'

        element.val(username)

        $('#submit').click()

        this.timeout(5000)

        setTimeout(() => {
            assert.equal(element.siblings('.form-control-feedback').text(), '用户名已存在')
            done()
        }, 1000)
    })

    it('validation success and submit', function (done) {
        $('#username').val('12345678911')
        $('#password').val('1234567')
        $('#confirm').val('1234567')
        $('#email').val('page@gmail.com')
        $('#sex').val('保密')
        $('#phone').val('12345678911')

        $('#submit').click()

        this.timeout(5000)

        setTimeout(() => {
            assert.equal(201, $('#submit').data('code'))
            done()
        }, 1000)
    })
})