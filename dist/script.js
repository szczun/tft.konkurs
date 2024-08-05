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

// Endpoint do backendu
async function getSummonerPuuid(players_array) {
    let puuid_array = [];

    for (let i = 0; i < players_array.length; i++) {
        const url = `/.netlify/functions/server-puuid`;
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify( players_array[i] )
        });
        const data = await response.json();
        puuid_array.push(data.puuid);
        console.log(data.puuid);
    }
    return puuid_array;
}

async function getSummonerId(summoners_puuid, players_array) {
    let summoners_id = [];

    for (let i = 0; i < summoners_puuid.length; i++) {
        const player = players_array[i];
        const region = (player.tag === "EUW") ? "euw1" : "eun1";
        var object = {
            puuid: summoners_puuid[i]
        };
        const url = `/.netlify/functions/server-id?region=${region}`;
        console.log(object);
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(object)
        });
        const data = await response.json();
        if (data.id) {
            summoners_id.push(data.id);
            console.log(data.id);
        } else {
            console.error(`Error fetching summoner ID for puuid ${object.puuid}`);
        }
    }
    return summoners_id;
}

async function getSummoner(summoners_id, players_array) {
    let summoners = [];

    for (let i = 0; i < summoners_id.length; i++) {
        const player = players_array[i];
        const region = (player.tag === "EUW") ? "euw1" : "eun1";
        const id_object = {
            id: summoners_id[i]
        };
        const url = `/.netlify/functions/server-summoner-info?region=${region}`;
        console.log(id_object);
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(id_object)
        });

        const data = await response.json();
        
        // Sprawdź, czy data zawiera oczekiwane właściwości
        if (data.tier === undefined) {
            // Zwróć domyślne wartości w przypadku błędnych danych
            const summoner = {
                nickname: player.nickname, // Dodaj nickname
                tier: "unranked",
                rank: " ",
                lp: 0,
                wins: 0,
                losses: 0,
                tier_val: 0,
                rank_val: 0
            };
            summoners.push(summoner);
            continue;
        }

        const summoner = {
            nickname: player.nickname, // Dodaj nickname
            tier: data.tier,
            rank: data.rank,
            lp: data.lp,
            wins: data.wins,
            losses: data.losses,
            tier_val: 0,
            rank_val: 0
        };

        summoners.push(summoner);
    }
    return summoners;
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

        row.innerHTML = `
            <td class="place">${index + 1}.</td>
            <td class="nickname">${player.nickname}</td>
            <td class="tier">${player.tier}
                <img class="tier-image" src="images/Rank=${player.tier}.png" alt="${player.tier}">
            </td>
            <td class="rank">${player.rank}</td>
            <td class="lp">${player.lp} lp</td>`
        ;

        tableBody.appendChild(row);
    });
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
