// Applies schema-orion.sql to local or Railway MySQL.
// Usage: node migrate-orion.js [local|railway]
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const TARGETS = {
  local: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'ChelsyTinevimbo@2003',
    database: 'techbridge_africa',
  },
  railway: {
    host: 'reseau.proxy.rlwy.net',
    port: 24135,
    user: 'root',
    password: 'afrntGirildfdinUqjfQCbBXFdVeqVlA',
    database: 'railway',
  },
};

// Errors that mean "already applied" — safe to skip on re-run
const SKIPPABLE = ['ER_DUP_FIELDNAME', 'ER_TABLE_EXISTS_ERROR', 'ER_DUP_KEYNAME', 'ER_DUP_ENTRY', 'ER_CANT_DROP_FIELD_OR_KEY'];

async function run() {
  const target = process.argv[2] || 'local';
  const config = TARGETS[target];
  if (!config) {
    console.error(`Unknown target "${target}". Use: local | railway`);
    process.exit(1);
  }

  const sql = fs.readFileSync(path.join(__dirname, 'schema-orion.sql'), 'utf8');
  const statements = sql
    .split(';')
    .map((s) => s.replace(/--.*$/gm, '').trim())
    .filter(Boolean);

  const conn = await mysql.createConnection({ ...config, multipleStatements: false });
  console.log(`Connected to ${target} (${config.host}:${config.port}/${config.database})`);

  let applied = 0, skipped = 0, failed = 0;
  for (const stmt of statements) {
    const label = stmt.slice(0, 70).replace(/\s+/g, ' ');
    try {
      await conn.query(stmt);
      applied++;
      console.log(`  OK      ${label}`);
    } catch (err) {
      if (SKIPPABLE.includes(err.code)) {
        skipped++;
        console.log(`  SKIP    ${label} (${err.code})`);
      } else {
        failed++;
        console.error(`  FAIL    ${label}\n          ${err.message}`);
      }
    }
  }

  console.log(`\nDone: ${applied} applied, ${skipped} skipped, ${failed} failed.`);
  await conn.end();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
