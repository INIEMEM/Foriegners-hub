import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { error } = await supabase.from('rentals').insert({
    user_id: '01877f42-d1ef-4c91-bc75-6b212336b215',
    bike_id: null,
    status: 'AWAITING_PAYMENT',
    type: 'NEW',
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    total_amount: 170,
    deposit_amount: 50,
    notes: '{}'
  });
  console.log('Error:', error);
}
test();
