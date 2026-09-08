const { createClient } = require('@supabase/supabase-js');

// manually grab the keys from .env.local
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('rentals').insert({
    user_id: '01877f42-d1ef-4c91-bc75-6b212336b215',
    status: 'AWAITING_PAYMENT',
    type: 'NEW',
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    total_amount: 170,
    deposit_amount: 50,
  });
  console.log('Error:', error);
}
test();
