import pool from '../config/db';
import fs from 'fs';
import path from 'path';

const runMigration = async () => {
  try {
    const schemaPath = path.join(__dirname, '../db/migrations/001_create_messages.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running messages migration...');
    await pool.query(schemaSql);
    console.log('Messages migration completed successfully');
    process.exit(0);
  } catch (error: any) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
};

runMigration();
