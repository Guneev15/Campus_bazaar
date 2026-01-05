import pool from '../config/db';
import fs from 'fs';
import path from 'path';

const runMigration = async () => {
  try {
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running migration...');
    await pool.query(schemaSql);
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error: any) {
    console.error('Migration failed:', error.message);
    if (error.code) console.error('Error Code:', error.code);
    process.exit(1);
  }
};

runMigration();
