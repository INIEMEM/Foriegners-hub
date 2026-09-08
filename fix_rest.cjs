const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function run() {
  const res = await fetch(`${URL}/rest/v1/rentals?status=eq.ACTIVE&select=id,user_id,profiles!inner(email)&profiles.email=eq.j9313627@gmail.com`, {
    headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
  });
  const rentals = await res.json();
  if (!rentals || rentals.length === 0) {
    console.log("No active rentals.");
    return;
  }
  const rental = rentals[0];
  console.log("Rental found:", rental.id);

  // Update to CONTRACT_PENDING
  await fetch(`${URL}/rest/v1/rentals?id=eq.${rental.id}`, {
    method: 'PATCH',
    headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'CONTRACT_PENDING' })
  });
  
  // Create contract
  await fetch(`${URL}/rest/v1/contracts`, {
    method: 'POST',
    headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rental_id: rental.id,
      user_id: rental.user_id,
      version: 'v1.0',
      status: 'PENDING'
    })
  });
  console.log("Done fixing rental!");
}
run();
