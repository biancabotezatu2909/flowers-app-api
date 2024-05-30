const sql = require('msnodesqlv8');

const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=.;Database=mpp-flowers;Trusted_Connection=yes;';


sql.open(connectionString, (err, conn) => {
  if (err) {
    console.error('Error occurred:', err);
    return;
  }

  const query = 'SELECT * FROM Flowers';
  const query2 = 'SELECT * FROM Users';

  conn.query(query2, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
    } else {
      console.log(results);
    }

    conn.close();
  });
});