describe('check feature', () => {
    it('show error messages', () => {
        browser.get('/')

        expect(element.all(by.css('.form-group.row')).first().getAttribute('class')).not.toMatch(/has-warning/)

        var btn = $('#submit')

        btn.click()

        expect($('#username').getAttribute('class')).toMatch(/form-control-warning/)
        expect(element.all(by.css('.form-group.row')).first().getAttribute('class')).toMatch(/has-warning/)
        expect(element(by.binding('view_model.username.msg')).getText()).toEqual('用户名是必须的')

        $('#username').sendKeys('1234')
        $('#password').click()

        expect(element(by.binding('view_model.username.msg')).getText()).toEqual('用户名长度小于6')

        $('#username').clear().sendKeys('1234567891011')
        btn.click()

        expect(element(by.binding('view_model.username.msg')).getText()).toEqual('用户名长度超过11')

        $('#confirm').sendKeys('1')
        btn.click()

        expect(element(by.binding('view_model.confirm.msg')).getText()).toEqual('确认密码必须和密码保持一致')

        $('#email').sendKeys('1')
        btn.click()

        expect(element(by.binding('view_model.email.msg')).getText()).toEqual('email格式不正确')

        $('#sex').sendKeys('1')
        btn.click()

        expect(element(by.binding('view_model.sex.msg')).getText()).toEqual('性别输入值不在限定范围之内')

        $('#phone').sendKeys('1')
        btn.click()

        expect(element(by.binding('view_model.phone.msg')).getText()).toEqual('手机号码长度必须为11')

        $('#phone').clear().sendKeys('1831130990a')
        btn.click()

        expect(element(by.binding('view_model.phone.msg')).getText()).toEqual('手机号码值类型错误')
    })

    it('check one input item and show error msg', () => {
        var username = $('#username')
        var password = $('#password')

        username.clear().click()

        password.click()

        expect(element(by.binding('view_model.username.msg')).getText()).toEqual('用户名是必须的')

        username.sendKeys('12345678910')
        password.click()

        browser.sleep(1000)
        expect(element(by.binding('view_model.username.msg')).getText()).toEqual('用户名已存在')
    })

    it('async error message', () => {
        $('#phone').clear().sendKeys('12345678910')
        $('#submit').click()
        browser.sleep(1000)
        expect(element(by.binding('view_model.phone.msg')).getText()).toEqual('手机号已存在')
    })

    it('validation success and submit', () => {
        $('#username').clear().sendKeys('12345678911')
        $('#password').clear().sendKeys('1234567')
        $('#confirm').clear().sendKeys('1234567')
        $('#email').clear().sendKeys('page@gmail.com')
        $('#sex').clear().sendKeys('保密')
        $('#phone').clear().sendKeys('12345678911')

        $('#submit').click()
        browser.sleep(1000)
        expect($('#submit').getAttribute('data-code')).toEqual('201')
    })
})