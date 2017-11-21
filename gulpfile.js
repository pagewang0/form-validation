var fs = require('fs')
var gulp = require('gulp')

gulp.task('umd', function () {
  var charset = 'utf-8'
  var file = fs.readFileSync('index.js', charset)
  var wrap = fs.readFileSync('wrap.js', charset)
  var arr = file.replace('\r\n', '\n').split('\n')
  var arr2 = wrap.replace('\r\n', '\n').split('\n')

  arr.forEach((line, i) => {
    line = '  ' + line
    arr2.splice(5 + i, 0, line)
  })

  file = arr2.join('\r\n')
  fs.writeFileSync('dist/form-validation.js', file, charset)
})