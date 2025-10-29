const ngrok = require('@ngrok/ngrok');

(async function() {
    try {
        const url = await ngrok.connect({
            addr: process.env.PORT || 5000,
            authtoken: process.env.NGROK_AUTHTOKEN
        });
        console.log('Ngrok public URL:', url);
    } catch (err) {
        console.error('Ngrok failed:', err);
    }
})();
