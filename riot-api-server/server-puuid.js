// const fetch = require("node-fetch");

const { apiKey } = process.env;

exports.handler = async (event, context) => {
    const params = JSON.parse(event.body);
    const { nickname, tag } = params;
    const region = "europe";
    const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${nickname}/${tag}`;

    try {
        const response = await fetch(url, {
            headers: {
                "X-Riot-Token": apiKey
            }
        });
        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify({puuid: data.puuid })
        };
    } catch (err){
        return { statusCode: 422, body: err.stack};
    }
};