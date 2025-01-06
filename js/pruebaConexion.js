const DBConnection = require('./claseConexion');

(async () => {
  const db = new DBConnection();

  try {
    const results = await db.query('SELECT NOW() AS currentTime');
    console.log('Hora actual desde la base de datos:', results[0].currentTime);
  } catch (err) {
    console.error('Error ejecutando la consulta:', err.message);
  } finally {
    db.close();
  }
})();