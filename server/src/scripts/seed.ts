import pool from '../config/db';

const seedCategories = async () => {
  const categories = [
    { name: 'Electronics', type: 'PHYSICAL' },
    { name: 'Books & Study Material', type: 'PHYSICAL' },
    { name: 'Hostel Essentials', type: 'PHYSICAL' },
    { name: 'Subject Notes', type: 'DIGITAL' },
    { name: 'Lab Manuals', type: 'DIGITAL' },
    { name: 'Previous Year Questions', type: 'DIGITAL' },
    { name: 'Miscellaneous', type: 'PHYSICAL' },
  ];

  try {
    console.log('Seeding categories...');
    for (const cat of categories) {
      await pool.query(
        'INSERT INTO categories (name, type) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [cat.name, cat.type]
      );
    }
    console.log('Categories seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedCategories();
