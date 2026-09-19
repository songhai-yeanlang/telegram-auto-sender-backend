const randomDelay = (min, max) => {
    const ms = Math.floor(Math.random() * (max - min + 1) + min) * 1000;
    return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = { randomDelay };