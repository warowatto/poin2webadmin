const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const morgan = require('morgan')

app.use(morgan('dev'))
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'public', 'pug'))
app.locals.pretty = true

// passport
require('./modules/auth')(app)

function loginService(req, res, next) {
    // console.log(session)
    if (req.session.passport && req.session.passport.user) {
        next()
    } else {
        res.redirect('/login')
    }
}


app.use('/', loginService)

app.get('/', (req, res) => {
    res.redirect('/dashboard')
})

app.use('/dashboard', require('./routers/dashboard'))
app.use('/machine', require('./routers/machine'))
app.use('/company', require('./routers/company'))
app.use('/products', require('./routers/product'))

let port = 3000
app.listen(port, () => {
    console.log('http://localhost:3000')
})