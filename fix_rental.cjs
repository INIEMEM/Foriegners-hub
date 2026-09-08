const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: rentals } = await supabase.from('rentals').select('*, profiles!inner(email)').eq('profiles.email', 'j9313627@gmail.com').eq('status', 'ACTIVE');
  if (!rentals || rentals.length === 0) {
    console.log("No active rentals for this user.");
    return;
  }
  const rental = rentals[0];
  console.log("Found rental to fix:", rental.id);

  await supabase.from('rentals').update({ status: 'CONTRACT_PENDING' }).eq('id', rental.id);
  
  const { data: existingContract } = await supabase.from('contracts').select('id').eq('rental_id', rental.id);
  if (!existingContract || existingContract.length === 0) {
    await supabase.from('contracts').insert({
      rental_id: rental.id,
      user_id: rental.user_id,
      version: "v1.0",
      status: "PENDING"
    });
    console.log("Created PENDING contract.");
  } else {
    console.log("Contract already exists.");
  }
}
run();
