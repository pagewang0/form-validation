(function() {
  var Validator = window.Validator;
  var validator = window.validator;
  var request = window.superagent; // superagent lib
  var form = document.getElementById('form');
  var v = new Validator({
    username: { required: true, length: { max: 11, min: 6 } },
    password: { required: true, length: { max: 11, min: 6 } },
    confirm: { required: true, equal: 'password' }, // equal: string/function
    email: { required: true, regex: validator.isEmail }, // regex: string/function
    sex: { required: true, enum: ['男', '女', '保密'] },
    phone: { required: true, type: Number, length: 11, regex: /^1\d{10}/ },
  });

  v.messages({
    username: { required: '用户名是必须的', length: { max: '用户名长度超过11', min: '用户名长度小于6' } },
    password: { required: '密码是必须的', length: { max: '密码长度超过11', min: '密码长度小于6' } },
    confirm: { required: '确认密码是必须的', equal: '确认密码必须和密码保持一致' },
    email: { required: 'email是必须的', regex: 'email格式不正确' },
    sex: { required: '性别是必须的', enum: '性别输入值不在限定范围之内' },
    phone: { required: '手机号码是必须的', type: '手机号码值类型错误', length: '手机号码长度必须为11', regex: 'phone格式不正确' }
  })
  .set(function (err, field) {
    var element = $('#' + field);

    if (err) {
      element.addClass('form-control-danger');
      element.parent().parent().addClass('has-danger');
      element.siblings('.form-control-feedback').text(err);
    }
  })
  .reset(function(field) {
    var element = $('#' + field);

    element.removeClass('form-control-danger');
    element.parent().parent().removeClass('has-danger');
    element.siblings('.form-control-feedback').text('');
  });

  v.path('username').get(function () {
    return document.getElementById('username').value;
  })
  .validate(function (done) {
    request('/username')
    .query({ username: this.value })
    .end((err, res) => {
      var msg = '用户名已存在';

      if (err) {
        done(msg);
        return;
      };

      done();
    });
  })
  .message.set(function (err) {
    var element = $('#username');

    if (err) {
      element.addClass('form-control-warning');
      element.parent().parent().addClass('has-warning');
      element.siblings('.form-control-feedback').text(err);
    };
  }).reset(function () {
    var element = $('#username');

    element.removeClass('form-control-warning');
    element.parent().parent().removeClass('has-warning');
    element.siblings('.form-control-feedback').text('');
  });

  v.path('phone').validate(function (done) {
    request('/phone')
    .query({ phone: this.value })
    .end((err, res) => {
      var msg = '手机号已存在';

      if (err) {
        done(msg);
        return;
      };

      done();
    });
  });

  document.getElementById('username').addEventListener('blur', function () {
    v.check_one('username');
  }, false);

  var handle_submit = function (event) {
    try {
      event.preventDefault();
      v.check();
    } catch(e) {
      console.log(e); // for debug
      event.preventDefault();
    }
  };

  form.addEventListener('submit', handle_submit, false);

  v.submit(function() {
    form.removeEventListener('submit', handle_submit, false);
    document.getElementById('submit').click();
  });

  v.get_errors(function (messages) {
    console.log(messages);
  });
})();