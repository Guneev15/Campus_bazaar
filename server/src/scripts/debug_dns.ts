import dns from 'dns';
import dotenv from 'dotenv';
dotenv.config();

console.log('DB URL defined:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
    const host = process.env.DATABASE_URL.split('@')[1].split(':')[0];
    console.log('Looking up:', host);
    dns.lookup(host, (err, address, family) => {
        if (err) console.error('DNS Lookoup failed:', err);
        else console.log('Resolved:', address, 'Family:', family);
    });
}
