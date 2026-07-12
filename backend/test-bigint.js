console.log("Testing BigInt JSON serialization...");
try {
  const obj = { startedAt: 1234567890123n };
  console.log(JSON.stringify(obj));
} catch (err) {
  console.error("Error:", err.message);
}
