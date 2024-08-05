class Player {
    constructor(nickname, tag){
        this.nickname = nickname;
        this.tag = tag;
    }
}
const kubon = new Player("Jan III Sobieski", "EUW");
const xntentacion = new Player("MÅMMØN", "EUW");
const remsua = new Player("remsua", "rmsa");
const wujek_luki = new Player("Koweras", "EUNE");
const agravein = new Player("Dv1 AgraveiN", "4444");
const kasix = new Player("Kasix", "ASAP");
const diables = new Player("LoversByChoice", "HOT");
const nieuczesana = new Player("SiblingsByChance","HOT");

players_array = [kubon, xntentacion, remsua, wujek_luki, agravein, kasix, diables, nieuczesana];

// const loadingDiv = document.querySelector(".info-bar")

let isLoadingFlag = true;

// Endpoint do backendu
async function getSummonerPuuid(players_array) {
    const requests = players_array.map(player =>
        fetch(`/.netlify/functions/server-puuid`, {
            method: "POST",
            body: JSON.stringify(player)
        }).then(response => response.json())
    );
    
    const results = await Promise.all(requests);
    return results.map(data => data.puuid);
}

async function getSummonerId(summoners_puuid, players_array) {
    const requests = summoners_puuid.map((puuid, i) => {
        const player = players_array[i];
        const region = (player.tag === "EUW") ? "euw1" : "eun1";
        const url = `/.netlify/functions/server-id?region=${region}`;
        
        return fetch(url, {
            method: "POST",
            body: JSON.stringify({ puuid })
        }).then(response => response.json());
    });

    const results = await Promise.all(requests);
    return results.map(data => data.id);
}

async function getSummoner(summoners_id, players_array) {
    const requests = summoners_id.map((id, i) => {
        const player = players_array[i];
        const region = (player.tag === "EUW") ? "euw1" : "eun1";
        const url = `/.netlify/functions/server-summoner-info?region=${region}`;

        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id })
        }).then(response => response.json());
    });

    const results = await Promise.all(requests);
    return results.map((data, i) => {
        const player = players_array[i];
        return {
            nickname: player.nickname,
            tier: data.tier || "unranked",
            rank: data.rank || " ",
            lp: data.lp || 0,
            wins: data.wins || 0,
            losses: data.losses || 0,
            tier_val: 0,
            rank_val: 0,
            tag: player.tag
        };
    });
}

function setValueToRank(summoners) {
    // Przypisz wartości rang
    for (let player of summoners) {
        switch (player.tier) {
            case "BRONZE":
                player.tier_val = 1;
                break;
            case "SILVER":
                player.tier_val = 2;
                break;
            case "GOLD":
                player.tier_val = 3;
                break;
            case "PLATINUM":
                player.tier_val = 4;
                break;
            case "EMERALD":
                player.tier_val = 5;
                break;
            case "DIAMOND":
                player.tier_val = 6;
                break;
            case "MASTER":
                player.tier_val = 7;
                break;
            case "GRANDMASTER":
                player.tier_val = 8;
                break;
            case "CHALLENGER":
                player.tier_val = 9;
                break;
            default:
                player.tier_val = 0;
                break;
        }

        switch(player.rank) {
            case "I":
                player.rank_val = 1;
                break;
            case "II":
                player.rank_val = 2;
                break;
            case "III":
                player.rank_val = 3;
                break;
            case "IV":
                player.rank_val = 4;
                break;
            default:
                player.tier_val = 0;
                break;
        }
    }

    // Sortowanie według tier_val

    summoners.sort((a, b) => {
        // Najpierw sortuj według tier_val
        if (a.tier_val !== b.tier_val) {
            return b.tier_val - a.tier_val;
        }
        // Jeśli tier_val jest taki sam, sortuj według rank_val
        return a.rank_val - b.rank_val;
    });

    return summoners;
}

function updateTable(summoners) {
    const tableBody = document.querySelector('.player');

    tableBody.innerHTML = '';

    summoners.forEach((player, index) => {
        const row = document.createElement('tr');
        row.classList.add('table-row');

        if(player.region === "euw1"){
            player.region = "euw";
        }else{
            player.region = "eune";
        }

        const profileUrl = `https://lolchess.gg/profile/${player.region}/${player.nickname}-${player.tag}/set12`;

        row.innerHTML = `
            <td class="place">${index + 1}.</td>
            <td class="nickname"><a href="${profileUrl}" target="_blank">${player.nickname}</a></td>
            <td class="tier">${player.tier}
                <img class="tier-image" src="images/Rank=${player.tier}.png" alt="${player.tier}">
            </td>
            <td class="rank">${player.rank}</td>
            <td class="lp">${player.lp} lp</td>
        `;

        tableBody.appendChild(row);
    });
}


function setLoading (isLoadingFlag){
    loadingDiv.classList.toggle(".hidden", isLoadingFlag);
}

async function main() {
    const puuid_array_response = await getSummonerPuuid(players_array);

    if (!puuid_array_response || puuid_array_response.length === 0) {
        console.error("No PUUIDs received or an error occurred.");
        return;
    }

    const id_array_response = await getSummonerId(puuid_array_response, players_array);

    if (!id_array_response || id_array_response.length === 0) {
        console.error("No IDs received or an error occurred.");
        return;
    }

   const summoners_array_response = await getSummoner(id_array_response, players_array);

    if (!summoners_array_response || summoners_array_response.length === 0) {
        console.error("No summoners received or an error occurred.");
        return;
    }
    const sorted_summoners = setValueToRank(summoners_array_response);
    updateTable(sorted_summoners);
 }

main();
