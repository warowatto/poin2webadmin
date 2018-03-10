const Observable = require('rxjs').Observable
const router = require('express').Router()
const db = require('../modules/database')

let machineSellListQuery = `
SELECT 
	Machines.id as machineId,
	deviceName,
	displayName,
	SUM(amount + point) as sell
FROM Machines 
LEFT JOIN Payments ON Payments.machineId = Machines.id
WHERE Machines.companyId = ?
    AND Payments.sendToCompany = false
GROUP BY Machines.id
ORDER BY sell DESC;`;

let companyPaymentListQuery = `

`;


router.get('/', (req, res) => {
    let user = req.session.passport.user
    let companyId = user.id

    db.query(machineSellListQuery, [companyId])
        .subscribe(
            results => {
                console.log(results)
                res.render('index', {
                    title: 'Poin - 대시보드',
                    username: req.session.passport.user.name,
                    value: results
                })
            },
            err => {
                console.log(err)
                res.send('자료를 찾아오는데 문제가 발생하였습니다' + err)
            })
})

module.exports = router