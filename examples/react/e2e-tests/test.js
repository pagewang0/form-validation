function clear(elem) {
    elem.getAttribute('value').then(function (text) {
        var len = text.length
        var backspaceSeries = Array(len+1).join(protractor.Key.BACK_SPACE);
        elem.sendKeys(backspaceSeries);
    })
}

describe('check feature', () => {
    it('show error messages', () => {
        browser.get('/')

        browser.driver.wait(function () {
          return browser.isElementPresent(by.css('.form-group.row'))
        })
        expect(element.all(by.css('.form-group.row')).first().getAttribute('class')).not.toMatch(/has-warning/)

        var btn = $('#submit')

        btn.click()

        expect($('#username').getAttribute('class')).toMatch(/form-control-warning/)
        // todo fix bug
        expect(element.all(by.css('.form-group.row')).first().getAttribute('class')).toMatch(/has-warning/)
        expect(element(by.id('username')).element(by.xpath('following-sibling::div')).getText()).toEqual('用户名是必须的')

        $('#username').sendKeys('1234')
        $('#password').click()

        expect(element(by.id('username')).element(by.xpath('following-sibling::div')).getText()).toEqual('用户名长度小于6')

        $('#username').clear().sendKeys('1234567891011')
        btn.click()

        expect(element(by.id('username')).element(by.xpath('following-sibling::div')).getText()).toEqual('用户名长度超过11')

        $('#confirm').sendKeys('1')
        btn.click()

        expect(element(by.id('confirm')).element(by.xpath('following-sibling::div')).getText()).toEqual('确认密码必须和密码保持一致')

        $('#email').sendKeys('1')
        btn.click()

        expect(element(by.id('email')).element(by.xpath('following-sibling::div')).getText()).toEqual('email格式不正确')

        $('#sex').sendKeys('1')
        btn.click()

        expect(element(by.id('sex')).element(by.xpath('following-sibling::div')).getText()).toEqual('性别输入值不在限定范围之内')

        $('#phone').sendKeys('1')
        btn.click()

        expect(element(by.id('phone')).element(by.xpath('following-sibling::div')).getText()).toEqual('手机号码长度必须为11')

        $('#phone').clear().sendKeys('1831130990a')
        btn.click()

        expect(element(by.id('phone')).element(by.xpath('following-sibling::div')).getText()).toEqual('手机号码值类型错误')
    })

    it('check one input item and show error msg', () => {
        var username = element(by.id('username'))
        var password = $('#password')

        clear(username)

        username.click()

        password.click()

        expect(element(by.id('username')).element(by.xpath('following-sibling::div')).getText()).toEqual('用户名是必须的')

        username.sendKeys('12345678910')

        password.click()

        expect(element(by.id('username')).element(by.xpath('following-sibling::div')).getText()).toEqual('用户名已存在')
    })

    it('async error message', () => {
        var phone = element(by.id('phone'))

        clear(phone)
        phone.sendKeys(12345678910)
        $('#submit').click()
        browser.sleep(1000)
        expect(element(by.id('phone')).element(by.xpath('following-sibling::div')).getText()).toEqual('手机号已存在')
    })

    it('validation success and submit', () => {
        var username = element(by.id('username'))
        var password = element(by.id('password'))
        var confirm = element(by.id('confirm'))
        var email = element(by.id('email'))
        var sex = element(by.id('sex'))
        var phone = element(by.id('phone'))

        clear(username)
        clear(password)
        clear(confirm)
        clear(email)
        clear(sex)
        clear(phone)

        username.sendKeys('12345678911')
        password.sendKeys('1234567')
        confirm.sendKeys('1234567')
        email.sendKeys('page@gmail.com')
        sex.sendKeys('保密')
        phone.sendKeys('12345678911')

        $('#submit').click()

        browser.sleep(1000)

        expect($('#submit').getAttribute('data-code')).toEqual('201')
    })
})