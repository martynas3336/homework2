var mysql = require('mysql');
var db_config = require('../config/db_config');

function Connection({db_config={}}={}) {
  this.db_config = db_config;
  this.con = {};
}

Connection.prototype.handleDisconnect = async function() {
  this.con = mysql.createConnection(db_config);

  this.con.connect((err) => {
    if(err) {
      console.log('error when connecting to db: ', err);
      setTimeout(this.handleDisconnect.bind(this), 2000);
    }
  })

  this.con.on('error', (err) => {
    console.log('db error', err);
    if(err.code == 'PROTOCOL_CONNECTION_LOST')
    {
      this.handleDisconnect();
    } else {
      throw err;
    }
  })
}

Connection.prototype.query = async function(query, parameters=[]) { return new Promise((resolve, reject) => {
  this.con.query(query, parameters, function(err, rows) {
    if(err)
    {
      console.log(err);
      reject(err);
    } else {
      resolve(rows);
    }
  })
})}

var connection = new Connection(db_config);
connection.handleDisconnect();


module.exports = connection;
