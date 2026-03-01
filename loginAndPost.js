import 'dotenv/config';
// use built-in global fetch in Node 20+
(async()=>{
  const loginRes = await fetch('http://localhost:5100/api/admin/login',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({password:'admin'})
  });
  console.log('login status', loginRes.status);
  console.log('login body', await loginRes.text());
  const cookie = loginRes.headers.get('set-cookie');
  console.log('cookie',cookie);
  const evRes = await fetch('http://localhost:5100/api/events',{
    method:'POST',
    headers:{'Content-Type':'application/json', 'Cookie':cookie||''},
    body: JSON.stringify({name:'TestEvent',date:'today',description:'short',fullDescription:'long',type:'Solo',prize:'0',rules:['r1'],rounds:1})
  });
  console.log('event status', evRes.status, await evRes.text());
})();
