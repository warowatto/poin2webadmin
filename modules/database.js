const mysql = require('mysql')
const Observable = require('rxjs').Observable

const pool = mysql.createPool({
    host: 'aa11kbqrhpc77vp.cjdio7be0ee3.ap-northeast-2.rds.amazonaws.com',
    user: 'payot',
    password: 'Vpdldhxl2017',
    database: 'Poin',
    port: 3306
});

module.exports = {
    query: function (query, option) {
        return Observable.create(emit => {
            pool.getConnection((err, connction) => {
                if (err) {
                    emit.error(err)
                } else {
                    connction.query(query, option, (err, result, fieldInfo) => {
                        if (err) {
                            emit.error(err)
                        } else {
                            if (result) {
                                emit.next(result)
                            }
                        }
                    })
                }
            })
        })
    },
    update: function (query, params) {
        return Observable.create(emit => {
            pool.getConnection((err, connection) => {
                if (err) {
                    emit.error(err)
                } else {
                    connection.query
                }
            })
        })
    }


}