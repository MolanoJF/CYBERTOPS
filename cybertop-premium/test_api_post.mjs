async function testFlow() {
  const sessionId = "fa3e51fd-047d-4892-9292-e0b7c33ca8dc";
  const baseUrl = "http://localhost:3000";

  console.log(`1. Fetching session ${sessionId}...`);
  let res = await fetch(`${baseUrl}/api/session/${sessionId}`);
  let data = await res.json();
  console.log("Current state:", { currentStep: data.currentStep, isFinished: data.isFinished });

  console.log("\n2. POSTing to advance from Step 0 to Step 1 (Iniciar)...");
  res = await fetch(`${baseUrl}/api/session/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      optionChosen: null,
      responseTimeSeconds: 0
    })
  });
  console.log("POST Status:", res.status);
  data = await res.json();
  console.log("New state after Iniciar:", { currentStep: data.currentStep, isFinished: data.isFinished });

  console.log("\n3. POSTing Decision 1 Option A...");
  res = await fetch(`${baseUrl}/api/session/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      optionChosen: "A",
      responseTimeSeconds: 30
    })
  });
  console.log("POST Status:", res.status);
  const text = await res.text();
  console.log("Response text:", text);
}

testFlow().catch(console.error);
