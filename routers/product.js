const Observable = require('rxjs').Observable
const db = require('../modules/database')

const router = require('express').Router()

// 상품 홈
router.get('/', (req, res) => {
    // 서비스 중인 상품
    let companyId = req.session.passport.user.id
    let companyProducts = `
        SELECT 
            Products.id as id,
            Products.name as name,
            Products.serviceTime as serviceTime,
            Products.description as description,
            COUNT(Machines.id) as serviceCount,
            Products.create_at as create_at
        FROM MachineProducts
        LEFT JOIN Products ON MachineProducts.productId = Products.id
        LEFT JOIN Machines ON MachineProducts.machineId = Machines.id
        WHERE 
            Machines.companyId = ?
        GROUP BY productId
    `;

    db.query(companyProducts, [companyId])
        .subscribe(
            items => { 
                res.render('product', { "products": items })
            },
            err => {
                res.send(err)
            })
})

// 추가 상품 등록
router.post('/', (req, res) => {
    let params = {
        name: req.body.name,
        description: req.body.description,
        serviceTime: req.body.serviceTime,
        price: req.body.price
    }

    let insertQuery = `INSERT INTO Products SET ?`

    db.query(insertQuery, [params])
        .subscribe(
            result => {
                res.redirect('/product')
            }
        )
})

// 추가 상품 삭제
router.post('/:productId', (req, res) => {
    let productId = req.params.productId


})

module.exports = router