// តេស្តដោយមិនបាច់ឆ្លងកាត់ React 
// 💡 សូមលុបអក្សរខ្មែរ រួចយក API Key ថ្មីបំផុតរបស់បងមកដាក់ក្នុងសញ្ញា " " នេះ
const myApiKey = "AIzaSyBTgRyO2iir3nRDAJsUWebS5RKKm4Glwes";

async function testGoogleAI() {
    console.log("⏳ កំពុងភ្ជាប់ទៅកាន់ Google...");
    
    // យើងប្រើប្រាស់ Model ស្តង់ដារ gemini-1.5-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${myApiKey}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "សួស្តី AI!" }] }]
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error("\n❌ បរាជ័យ (Error)! Google បដិសេធសោរនេះ៖");
            console.error("មូលហេតុ:", data.error.message);
            console.error("លេខកូដ Error:", data.error.code);
        } else {
            console.log("\n✅ ជោគជ័យ ១០០% (Success)!");
            console.log("ចម្លើយពី AI:", data.candidates[0].content.parts[0].text);
            console.log("👉 បញ្ជាក់ថា: សោររបស់បងគឺល្អឥតខ្ចោះអត់មានបញ្ហាទេ!");
        }
    } catch (error) {
        console.error("\n❌ មិនអាចភ្ជាប់បានទាល់តែសោះ (Network Error):", error.message);
    }
}

testGoogleAI();