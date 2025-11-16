const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
const { JSDOM } = require("jsdom");

// === Replace these ===
const BOT_TOKEN = "8365735410:AAE_1opBA0vy-fIFpDW617VNsYpKTXAZbNY";
const CHAT_ID = "@Sarveshvozbot";
// =====================

// ✔ polling turned ON
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ✔ reply to /start
bot.on("message", (msg) => {
    const chatId = msg.chat.id;

    console.log("User said:", msg.text);

    if (msg.text === "/start") {
        bot.sendMessage(chatId, "Hello! 👋\nYour NSE alert bot is working perfectly!");
    }
});

async function checkAnnouncements() {
    try {
        const url = "https://www.nseindia.com/companies-listing/corporate-filings-announcements?subject=Awarding%20of%20order(s)/contract(s)";

        const response = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        const rows = document.querySelectorAll("tr");

        let found = false;
        let message = "⚡ *New Award/Order Found!*\n\n";

        rows.forEach(row => {
            const text = row.textContent;

            if (text.includes("Awarding of order") || text.includes("contract")) {
                found = true;
                message += `📌 ${text.trim()}\n\n`;
            }
        });

        if (found) {
            bot.sendMessage(CHAT_ID, message, { parse_mode: "Markdown" });
            console.log("Sent Telegram Alert!");
        } else {
            console.log("No new orders yet...");
        }
    } catch (error) {
        console.log("Error:", error.message);
    }
}

// Run every 30 seconds
setInterval(checkAnnouncements, 30000);

console.log("Bot started...");
