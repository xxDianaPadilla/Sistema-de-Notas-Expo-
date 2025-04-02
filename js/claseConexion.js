const mysql = require('mysql2');

class DBConnection {
  constructor() {
    this.connection = mysql.createConnection({
      host: 'localhost', 
      user: 'root',    
      password: 'Diana#2006', 
      database: 'BasededatosNotasEXPO' 
    });

    this.connect();
  }

  connect() {
    this.connection.connect((err) => {
      if (err) {
        console.error('Error conectando a la base de datos:', err.message);
        return;
      }
      console.log('Conexión exitosa a la base de datos.');
    });
  }

  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  close() {
    this.connection.end((err) => {
      if (err) {
        console.error('Error cerrando la conexión:', err.message);
        return;
      }
      console.log('Conexión cerrada.');
    });
  }

    beginTransaction(callback) {
        this.connection.beginTransaction(callback);
    }
    
    commit(callback) {
        this.connection.commit(callback);
    }
    
    rollback(callback) {
        this.connection.rollback(callback);
    }
}

module.exports = DBConnection;