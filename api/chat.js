// កូដនេះនឹងរត់នៅលើ Server Backend របស់ Vercel ដើម្បីលាក់ API Key របស់បង
export default async function handler(req, res) {
  // អនុញ្ញាតតែការបញ្ជូនទិន្នន័យប្រភេទ POST ប៉ុណ្ណោះ
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { prompt, systemInstruction, jsonMode } = req.body;
  
  // ទាញយកសោរពីកន្លែងសុវត្ថិភាពរបស់ Vercel
  const apiKey = process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "Missing API Key in Server" });

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  
  if (systemInstruction) payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  if (jsonMode) payload.generationConfig = { responseMimeType: "application/json" };

  try {
    // 💡 យើងប្តូរមកប្រើ gemini-1.5-flash ដើម្បីធានាភាពជោគជ័យ ១០០% សម្រាប់គ្រប់ Key ទាំងអស់
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
        // បោះ Error ចេញពី Google ឱ្យយើងដឹងច្បាស់ថាខុសត្រង់ណា
        return res.status(response.status).json({ error: data.error?.message || "Google API Error" });
    }
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    
    // បោះចម្លើយត្រលប់ទៅកាន់ App.jsx វិញ
    res.status(200).json({ text });
  } catch (error) {
    res.status(500).json({ error: "Server Failed to connect to Gemini" });
  }
}