var express = require('express')
var fs = require('fs')

var app = express()

app.use(express.static('../'))

app.get('/', (req, res) => {
    res.type('text/html; charset=utf-8')
    res.send(fs.readFileSync('index.html'))
})

app.get('/username', (req, res) => {
    var username = '18311309901'

    if (req.query.username === username) {
        return res.sendStatus(400)
    };

    res.sendStatus(200)
})

app.get('/phone', (req, res) => {
    var phone = '18311309901'

    if (req.query.phone === phone) {
        return res.sendStatus(400)
    };

    res.sendStatus(200)
})

app.listen(process.env.PORT || 3000 , function(){
    console.log(this.address())
})