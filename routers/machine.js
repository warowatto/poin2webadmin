const Observable = require('rxjs').Observable
const db = require('../modules/database')

const router = require('express').Router()

function getCompanyMachine(companyId) {
    let query = `SELECT * FROM Machines WHERE companyId = ?`

    return db.query(query, companyId)
}

// 장치 홈
router.get('/', (req, res) => {
    let companyId = req.session.passport.user.id

    getCompanyMachine(companyId)
        .subscribe(
            machines => {
                console.log(machines)
                let items = machines.map(item => {
                    item.isRunning = item.isRunning == 1
                    return item
                })
                res.render('machine', {
                    title: 'Poin - 장치',
                    machines: items,
                    username: req.session.passport.user.name
                })
            },
            err => {
                res.send(err)
            })
})

// 장치 상세 정보
router.get('/:machineId', (req, res) => {
    let user = req.session.passport.user
    let machineId = req.params.machineId

    let detailMachine = `SELECT * FROM Machines WHERE id = ?`
    let machineProducts = `
        SELECT
            id,
            name,
            description,
            serviceTime,
            price,
            create_at
        FROM MachineProducts
        LEFT JOIN Products ON MachineProducts.productId = Products.id
        WHERE machineId = ?`;
    let machineSell = `
        SELECT
            (amount + point) as price,
            sendToCompany as payment,
            pay_at
        FROM Payments
        WHERE machineId = ?
        ORDER BY pay_at DESC
        LIMIT 0, 30`;

    let details = db.query(detailMachine, [machineId])
    let products = db.query(machineProducts, [machineId])
    let seller = db.query(machineSell, [machineId])

    Observable.zip(details, products, seller, (mc, pr, sell) => {
        return {
            machine:mc,
            products:pr,
            sells: sell
        }
    }).subscribe(
        data => {
            console.log(data.sell)
            res.render('detail_machine', {
                title: 'Poin - 장치 상세',
                username: req.session.passport.user.name,
                machine: data.machine,
                products: data.products,
                sells: data.sells
            })
        },
        err => {
            res.send(err)
        }
    )
})

module.exports = router