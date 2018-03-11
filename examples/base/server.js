var express = require('express')
var fs = require('fs')
var path = require('path')

var app = module.exports = express()

app.use(express.static(path.join(__dirname, '../..')))

app.post('/user', (req, res) => {
    res.sendStatus(201)
})

app.get('/', (req, res) => {
    res.type('text/html; charset=utf-8')
    res.send(fs.readFileSync('examples/base/index.html'))
})

app.post('/', (req, res) => {
    res.send('create ok')
})

app.get('/username', (req, res) => {
    var username = '12345678910'

    if (req.query.username === username) {
        return res.sendStatus(400)
    };

    res.sendStatus(200)
})

app.get('/phone', (req, res) => {
    var phone = '12345678910'

    if (req.query.phone === phone) {
        return res.sendStatus(400)
    };

    res.sendStatus(200)
})

app.listen(process.env.PORT || 3000 , function(){
    console.log('Express server listening on port ' + this.address().port)
})