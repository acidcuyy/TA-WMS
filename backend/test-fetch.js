
async function main() {
  const loginRes = await fetch("http://localhost:3000/auth/login", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'taso_driver', password: 'taso' })
  });
  const loginData = await loginRes.json();
  console.log("Login:", loginData.success);

  const token = loginData.data.token;
  
  const shipRes = await fetch("http://localhost:3000/driver/shipments/REQ-863", {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const text = await shipRes.text();
  console.log("Shipment Response:", text);
}
main();
