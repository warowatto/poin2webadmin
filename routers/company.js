const Observable = require('rxjs').Observable

const router = require('express').Router()
const db = require('../modules/database')
const pass = require('../modules/password')

// 업체 정보 변경 폼
router.get('/', (req, res) => {
    let user = req.session.passport.user
    console.log(user)
    res.render('company', {
        title: 'Poin - 사용자 정보',
        username: req.session.passport.user.name,
        value: user
    })
})

// 업체 비밀번호 변경 폼
router.get('/password', (req, res) => {
    res.render('password')
})

// 업체 정보 변경
router.post('/', (req, res) => {
    let companyId = req.session.passport.user.id
    let params = {
        tel: req.body.tel,
        phone: req.body.phone,
        fax: req.body.fax,
        address: req.body.address,
        bankName: req.body.bankName,
        accountNumber: req.body.accountNumber,
        accountName: req.body.accountName,
        paymentInfo: req.body.message
    }

    let updateQuery = `UPDATE Companys SET ? WHERE id = ?`;

    db.query(updateQuery, [params, companyId])
        .flatMap(result => {
            let companyFindQuery = `SELECT * FROM Companys WHERE id = ?`;
            return db.query(companyFindQuery, [companyId])
        })
        .subscribe(
            comapny => {
                req.session.passport.user = comapny
                res.redirect('/company')
            },
            err => {
                res.redirect('/comapny')
            })
})

// 업체 비밀번호 변경
router.post('/', (req, res) => {
    let companyId = req.session.passport.user.id
    let password = req.body.password

    let updateQuery = `UPDATE Companys SET ? WHERE id = ?`

    let changePasswordObserver = pass.create(password)

    changePasswordObserver.flatMap(hashs => {
        let params = {
            password: hashs.hash,
            salt: hashs.salt
        }

        return db.query(updateQuery, [params, companyId])
    }).subscribe(
        update => {

            res.redirect('/logout')
        },
        err => {
            res.render()
        })
})

// 업체 비밀번호 조회
function validationPassword(companyId, password) {
    findCompany(companyId)
        .flatMap(user => {
            let salt = user.salt
            let inputHashObserver = pass.getHash(password, salt)
            return Observable.zip(Observable.of(user.password), inputHashObserver, (db, input) => {
                return db === input
            })
        })
}

function findCompany(companyId) {
    let userFindQuery = `SELECT * FROM Companys WHERE id = ?`
    return db.query(userFindQuery, [companyId])
}

module.exports = router