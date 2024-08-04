const { apiKey } = process.env;

exports.handler = async (event, context) => {
    const params = JSON.parse(event.body);
    const { puuid } = params;
    const region = event.queryStringParameters.region;
    const url = `https://${region}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${puuid}`;

    try {
        const response = await fetch(url, {
            header:{
                "X-Riot-Token": apiKey
            }
        });
        const data = await response.json();
        return{
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (err){
        return { statusCode: 422, body: err.stack};
    }
};