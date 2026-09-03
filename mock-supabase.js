const http = require('http');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,apikey,authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url;

  // Mock Auth
  if (url.includes('/auth/v1/user') || url.includes('/auth/v1/session')) {
    res.writeHead(200);
    res.end(JSON.stringify({ user: null, session: null }));
    return;
  }
  
  // Mock Bikes
  if (url.includes('/rest/v1/bikes?')) {
    res.writeHead(200);
    res.end(JSON.stringify([{
      id: 'b1', 
      b_code: 'B-ENGWE-001', 
      name: 'ENGWE M20', 
      status: 'AVAILABLE', 
      image_url: '/images/engwe-m20.jpg', 
      bike_categories: { name: 'Electric Bicycle' }, 
      description: 'The ENGWE M20 is a powerful and reliable electric bike suitable for city commutes.'
    }]));
    return;
  }

  // Mock Pricing Plans
  if (url.includes('/rest/v1/rental_pricing_plans')) {
    res.writeHead(200);
    res.end(JSON.stringify([
      { id: 'p1', name: '1 Week', total_price: 55 },
      { id: 'p2', name: '2 Weeks', total_price: 110 },
      { id: 'p3', name: '3 Weeks', total_price: 150 },
      { id: 'p4', name: '4 Weeks / 1 Month', total_price: 170 },
      { id: 'p5', name: '2 Months', total_price: 340 },
      { id: 'p6', name: '3 Months', total_price: 450 }
    ]));
    return;
  }

  // Mock Repair Services
  if (url.includes('/rest/v1/repair_services')) {
    res.writeHead(200);
    res.end(JSON.stringify([
      { name: 'Brake pad replacement' },
      { name: 'Tire repair' },
      { name: 'Chain service' }
    ]));
    return;
  }

  // Mock empty queries (Apartments, Rentals, etc.)
  res.writeHead(200);
  res.end(JSON.stringify([]));
});

server.listen(54321, () => {
  console.log('Mock Supabase server running on http://localhost:54321');
});
