const info = (message) => console.log(`[INFO] ${new Date().toLocaleString()}: ${message}`);
const error = (message, err) => console.error(`[ERROR] ${new Date().toLocaleString()}: ${message}`, err);

module.exports = { info, error };