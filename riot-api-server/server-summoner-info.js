
const { apiKey } = process.env;

exports.handler = async (event, context) => {
    const params = JSON.parse(event.body);
    const { id } = params;

    const region = event.queryStringParameters.region;

    const url = `https://${region}.api.riotgames.com/tft/league/v1/entries/by-summoner/${id}`;

    try {
        const response = await fetch(url, {
            headers: {
                "X-Riot-Token": apiKey
            }
        });

        if(!response.ok){
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.length === 0) {
            // Zwróć domyślne wartości, gdy brak danych
            return {
                statusCode: 200,
                body: JSON.stringify({
                    tier: "unranked",
                    rank: " ",
                    lp: 0,
                    wins: 0,
                    losses: 0
                })
            };
        }

        const leagueData = data[0];

        return {
            statusCode: 200,
            body: JSON.stringify({
                tier: leagueData.tier,
                rank: leagueData.rank,
                lp: leagueData.leaguePoints,
                wins: leagueData.wins,
                losses: leagueData.losses
            })
        };
    } catch (err) {
        return { statusCode: 422, body: JSON.stringify({ error: err.message }) };
    }
};