const Observable = require('rxjs').Observable

const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const logout = require('express-passport-logout')

const db = require('../modules/database')
const hash = require('../modules/password')

function findUser(email, password) {
    let findUserQuery = `SELECT * FROM Companys WHERE email = ? LIMIT 1;`;

    return db.query(findUserQuery, [email])
        .map(user => { return user[0] })
        .flatMap(user => {
            if (user) {
                return hash.getHash(password, user.salt)
                    .map(hash => {
                        if (hash === user.password) {
                            return user
                        } else {
                            throw "Password Not Matched"
                        }
                    })
            } else {
                throw "Not Found User"
            }
        })
}

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: true
}, (email, password, done) => {
    findUser(email, password)
        .subscribe(
            user => { done(null, user) },
            err => { done(err, null) })
}))

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

module.exports = app => {
    app.use(session({
        secret: 'payot_admin',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60
        }
    }))
    app.use(passport.initialize())
    app.use(passport.session())

    app.get('/login', (req, res) => {
        res.render('login')
    })

    app.post('/login', passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login'
    }))

    app.get('/signup', (req, res) => {
        res.render('signup')
    })

    app.post('/signup', (req, res) => {
        let email = req.body.email
        let password = req.body.password
        let name = req.body.name

        let userHash = hash.create(password)

        let insertQuery = `INSERT INTO Companys SET ?`;

        userHash.flatMap(result => {
            let userData = {
                email: email,
                name: name,
                password: result.hash,
                salt: result.salt
            }
            return db.query(insertQuery, [userData])
        }).subscribe(
            result => {
                res.redirect('/login')
            },
            err => {
                res.redirect('/signup')
            })
    })

    app.get('/logout', (req, res) => {
        req.session.destroy()
        res.clearCookie(`sid`)

        res.redirect('/login')
    })
}