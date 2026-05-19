import bcrypt from 'bcryptjs';

const passwords = [
  { email: 'hamisi.911.ltd@gmail.com', pwd: '911Hamisi.' },
  { email: 'JOHN MWANGI@GMAIL.COM', pwd: '0712345678' },
  { email: 'IMMACURATEDRIVING77@GMAIL.COM', pwd: 'ANTHONYN' }
];

async function hashAll() {
  for (const p of passwords) {
    const hash = await bcrypt.hash(p.pwd, 12);
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = '${p.email}';`);
  }
}

hashAll().catch(console.error);
