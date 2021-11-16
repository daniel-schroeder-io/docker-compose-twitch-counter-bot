const Redis = require("ioredis");
const client = new Redis({
    host: 'redis',
    port: '6379',
});
client.on("error", function(error) {
    console.error(error);
});

module.exports = {
    store: async (key, value, ttl_seconds) => {
        try {
            if(ttl_seconds == null){
                await client.set(key, value);
            } else {
                await client.set(key, value, 'ex', ttl_seconds);
            }
           
            return;
        }
        catch(e){
            throw Error(e)
        }
    },
    lookup: async (key) => {
        const res = await client.get(key);
        return res;
    },
}