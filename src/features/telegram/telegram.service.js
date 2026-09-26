const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); // npm i input

const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
// On first run, leave this blank. Once you get the string, save it in .env
const stringSession = new StringSession(process.env.SESSION_STRING || ""); 

let client = null;

const initClient = async () => {
    client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: async () => await input.text("Please enter your phone number: "),
        password: async () => await input.text("Please enter your 2FA password: "),
        phoneCode: async () => await input.text("Please enter the code you received: "),
        onError: (err) => console.log(err),
    });

    console.log("You are now connected as a Personal Account!");
    
    // Save this string to your .env file so you don't have to login again
    console.log("Save this SESSION_STRING in your .env:");
    console.log(client.session.save());

    return client;
};

const getClient = () => {
    if (!client) throw new Error("Client is not connected yet!");
    return client;
};

module.exports = { initClient, getClient };
