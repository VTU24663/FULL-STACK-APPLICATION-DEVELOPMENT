const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const dbName = process.env.DB_NAME || 'event_booking_system';
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8').replaceAll('event_booking_system', dbName);
  await connection.query(schema);

  await connection.changeUser({ database: dbName });

  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(password, 12);

  await connection.execute(
    `INSERT INTO admins (email, password_hash)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [email, passwordHash]
  );

  await connection.end();
  console.log(`Database "${dbName}" is ready. Admin: ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
