require('dotenv').config();
const tmi       = require('tmi.js');
const axios     = require('axios');

// This is called when tmi.js successfully connects to twitch servers
async function onConnectedHandler(addr, port) {
	console.log('I have connected')
}

async function onErrorHandler(error) {
	console.log('Error: ', error)
}

// handle the incoming messages from twitch chat
async function onMessageHandler(channel, userstate, message, self) {
    // Ignore echoed messages.
	if(self) return;

    if(message.trim().toLowerCase() == '!count'){
        try{
            let response = await axios.post(`http://api:3000/count`, userstate);
            await this.say(channel, `Count is: ${response.data.count}`)
        }catch(e){
            console.log(e)
        }
		
	}
}
async function refreshConnect(client, options, refresh_token) {
	try{
		let response = await axios.post(`https://id.twitch.tv/oauth2/token?`+
        `client_id=${process.env.TWITCH_CLIENT_ID}`+
        `&client_secret=${process.env.TWITCH_CLIENT_SECRET}`+
		`&refresh_token=${refresh_token}`,
        `&grant_type=refresh_token`)
		
		if(response.data != null && response.data.access_token != null && response.data.refresh_token != null){
			console.log('Got Refresh info');
			options.identity.password = response.data.access_token;
			client.opts = options;
            client.connect()
            .catch((err) => {
                console.log('Refresh Error.')
                console.log(err)
                return;
            });
		}
    }
    catch(err){
        console.log(err)
	}
}
const connect = async (client, tokens, channels) => {
    let options = {
        options: { debug: true, messagesLogLevel: "info" },
        connection: {
            reconnect: true,
            secure: true
        },
        identity: {
            username: process.env.TWITCH_USERNAME,
            password: tokens.AccessToken
        },
        channels: channels
    }
    try {
        client.opts = options;
        await client.connect();
    }
    catch(err) {
        console.log('Twitch connect error:')
		console.log(err)
        refreshConnect(client, options, tokens.RefreshToken)
    }
};

module.exports = (async function() {
    const tokens = { AccessToken: process.env.ACCESS_TOKEN, RefreshToken: process.env.REFRESH_TOKEN }
    // ADD CHANNELS TO JOIN HERE
    const channels = ['channel1', 'channel2'];
    
    const client = new tmi.Client();
	client.on('connected', onConnectedHandler);
	client.on('message', onMessageHandler);
    client.on('error', onErrorHandler);
    await connect(client, tokens, channels);
    return { client };
})();