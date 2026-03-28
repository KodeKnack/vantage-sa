import { hash } from 'bcryptjs';

async function main() {
  const hashed = await hash('Demo1234!', 10);
  console.log('Paste this into each passwordHash in lib/nextauth-options.ts:');
  console.log(hashed);
}

main();

