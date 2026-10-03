require('dotenv').config();
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');
const fs = require('fs');
const path = require('path');

const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const envPath = path.join(__dirname, '../../.env');

if (!apiId || !apiHash) {
    console.error(" Error: API_ID or API_HASH is missing in .env!");
    process.exit(1);
}

(async () => {
    console.log("\n==============================================");
    console.log("   Telegram Account Login / Change Number     ");
    console.log("==============================================\n");

    const stringSession = new StringSession(""); // Empty session to login with new number
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    try {
        await client.start({
            phoneNumber: async () => await input.text("1. Please enter new phone number (with country code, e.g. +855...): "),
            password: async () => await input.text("2. Please enter your 2FA password (leave blank if none): "),
            phoneCode: async () => await input.text("3. Please enter the OTP code you received in Telegram: "),
            onError: (err) => console.error("Connection error:", err.message),
        });

        const newSessionString = client.session.save();
        console.log("\n Connected successfully as new Telegram account!");

        // Automatically update SESSION_STRING in .env
        if (fs.existsSync(envPath)) {
            let envContent = fs.readFileSync(envPath, 'utf8');
            if (/SESSION_STRING=.*/.test(envContent)) {
                envContent = envContent.replace(/SESSION_STRING=.*/g, `SESSION_STRING=${newSessionString}`);
            } else {
                envContent += `\nSESSION_STRING=${newSessionString}\n`;
            }
            fs.writeFileSync(envPath, envContent, 'utf8');
            console.log(" Successfully updated SESSION_STRING in your .env file!");
        } else {
            console.log("\n Please save this SESSION_STRING in your .env manually:");
            console.log(newSessionString);
        }

        console.log("\n Finished! Now you can run: npm run dev\n");
    } catch (error) {
        console.error("\n Login failed:", error.message);
    } finally {
        try {
            await client.disconnect();
        } catch {}
        process.exit(0);
    }
})();
