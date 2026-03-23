require('dotenv').config();
const express = require('express');
const Groq = require('groq-sdk');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const groq = new Groq({ apiKey: process.env.API_KEY });

// 1. สร้าง "คลังความจำ" เก็บประวัติการคุย
let chatHistory = [];

app.post('/chat', async (req, res) => {
    const userPrompt = req.body.prompt;
    const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

    // หากกดปุ่มล้างแชท ให้รีเซ็ตความจำ
    if (userPrompt === "CLEAR_CHAT_MEMORY") {
        chatHistory = [];
        return res.json({ reply: "รีเซ็ตความจำเรียบร้อยแล้วเมี๊ยว!" });
    }

    // 2. เพิ่มข้อความที่ผู้ใช้พิมพ์ลงในประวัติ
    chatHistory.push({ role: "user", content: userPrompt });

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: `คุณคือ "เหมียวจีเนียส" AI ผู้ช่วยส่วนตัวที่ฉลาดและรวดเร็ว วันเวลาปัจจุบันคือ ${now} ตอบคำถามอย่างเป็นธรรมชาติและถูกต้องแม่นยำ` 
                },
                ...chatHistory // ส่งประวัติการคุยทั้งหมดไปให้บอทจำได้
            ],
            // 👇 นี่คือชื่อรุ่นสมองตัวท็อปปี 2026 ที่ใช้งานได้แน่นอนครับ 👇
            model: "llama-3.3-70b-versatile", 
            temperature: 0.3,
        });

        const reply = chatCompletion.choices[0]?.message?.content || "เมี๊ยว... คิดไม่ออกจริงๆ ครับ";
        
        // 3. เก็บคำตอบของบอทลงในประวัติด้วย
        chatHistory.push({ role: "assistant", content: reply });

        res.json({ reply: reply });
    } catch (error) {
        console.error("❌ เจอสาเหตุ Error แล้ว! รายละเอียดคือ:", error.message);
        res.status(500).json({ reply: "ระบบขัดข้องชั่วคราว ลองใหม่อีกครั้งนะเมี๊ยว! (เช็ค API Key ในไฟล์ .env ด้วยนะครับ)" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 บอทเหมียวจีเนียส (ความจำแม่น + สปีดไว) พร้อมแล้ว!`);
    console.log(`👉 เปิดที่: http://localhost:${PORT}`);
});