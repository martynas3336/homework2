const express = require('express');
const app = express();
const PORT = 6000;
const db_handle = require('./db/db_handle');
const mysql = require('mysql');

const getColumnName = async function({schemaName, tableName}={}) { return new Promise((resolve, reject) => {
  db_handle.query('SELECT `COLUMN_NAME` FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA` = ? AND `TABLE_NAME` = ?', [schemaName, tableName]).then((rows) => {
    let columns = rows.map(obj=>obj.COLUMN_NAME);
    return resolve({columns});
  }).catch((err) => {
    return reject(err);
  })
})}

const getCount = async function({tableName}={}) { return new Promise((resolve, reject) => {
  db_handle.query('SELECT COUNT(*) as count FROM ??', [tableName]).then((rows) => {
    let count = rows[0].count;
    return resolve({count});
  }).catch((err) => {
    return reject(err);
  })
})}



const queryWithLimit = async function({orderBy, perPage, page}={}) { return new Promise((resolve, reject) => {
  db_handle.query('SELECT * FROM sample_data '+ addOrderBy(orderBy) +'LIMIT ?, ?', [perPage * page, perPage]).then((rows) => {
    let result = rows;
    return resolve({result});
  }).catch((err) => {
    return reject(err);
  })
})}

const queryWithoutLimit = async function({orderBy}={}) { return new Promise((resolve, reject) => {
  db_handle.query('SELECT * FROM sample_data '+addOrderBy(orderBy)).then((rows) => {
    let result = rows;
    return resolve({result});
  }).catch((err) => {
    return reject(err);
  })
})}

app.get('/api/list', (req, res, next) => {

  let perPage = parseInt(req.query.perPage);
  let page = parseInt(req.query.page) - 1;
  let orderBy = req.query.orderBy || [];

  let maxPage = 0;
  let count = 0;
  let headers = [];
  let keyIdentifier = 'id';
  let result = [];

  orderBy.reverse();

  Promise.resolve()

  .then(() => { return new Promise((resolve, reject) => {
    getColumnName({schemaName:'test', tableName:'sample_data'}).then((res) => {
      headers = res.columns;
      return resolve();
    }).catch((err) => {
      return reject(err);
    })
  })})

  .then(() => { return new Promise((resolve, reject) => {
    getCount({tableName:'sample_data'}).then((res) => {
      count = res.count;
      return resolve();
    }).catch((err) => {
      return reject(err);
    })
  })})

  .then(() => { return new Promise((resolve, reject) => {
    if(perPage !== perPage)
    {
      maxPage = 0;
      queryWithoutLimit({orderBy}).then((res) => {
        result = res.result;
        return resolve();
      }).catch((err) => {
        return reject(err);
      })
    } else {
      maxPage = Math.floor((count + perPage) / perPage);
      queryWithLimit({orderBy, perPage, page}).then((res) => {
        result = res.result;
        return resolve();
      }).catch((err) => {
        return reject(err);
      })
    }
  })})

  .then(() => {
    res.json({maxPage:maxPage, headers:headers, keyIdentifier:keyIdentifier, result:result});
  }).catch((err) => {
    console.log(err);
    res.json({maxPage:0, headers:[], keyIdentifier:'', result:[]});
  })
})

app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
})

// RETURNS ORDER BY CLAUSE OR EMPTY STRING IF ARGUMENT IS EMPTY ARRAY
const addOrderBy = function(orderBy) {
  if(orderBy.length)
  {
    let query = 'ORDER BY ';
    orderBy.forEach((obj, i) => {

      Object.keys(obj).forEach((key) => {
        // ESCAPE VALUE
        let order = 'ASC';
        if(['ASC', 'DESC'].includes(obj[key]))
        {
          order = obj[key];
        }
        query += mysql.escapeId(key) + ' ' + order;
      })
      if(i != orderBy.length-1)
      {
        query += ', ';
      } else {
        query += ' ';
      }
    })
    return query;
  } else {
    return '';
  }
}

}
