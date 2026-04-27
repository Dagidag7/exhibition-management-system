const { Client } = require('pg');

const client = new Client({
  host: 'dpg-d7n5bbjbc2fs738k523g-a.virginia-postgres.render.com',
  port: 5432,
  database: 'exhibition_db',
  user: 'exhibition_system',
  password: 'jrXUNNDX8bc0STcdLjOdN0MhVbnMV1I8',
});

client.connect((err) => {
  if (err) {
    console.error('Connection error', err.stack);
    process.exit(1);
  }

  const sql1 = 'ALTER TABLE attendee ADD COLUMN IF NOT EXISTS password_changed BOOLEAN DEFAULT true;';
  const sql2 = 'ALTER TABLE attendee ADD COLUMN IF NOT EXISTS is_temporary_password BOOLEAN DEFAULT false;';

  client.query(sql1, (err, res) => {
    if (err) {
      console.error('Error adding password_changed column:', err);
    } else {
      console.log('✅ Added password_changed column');
    }

    client.query(sql2, (err, res) => {
      if (err) {
        console.error('Error adding is_temporary_password column:', err);
      } else {
        console.log('✅ Added is_temporary_password column');
      }

      client.end();
      console.log('✅ Done!');
    });
  });
});
