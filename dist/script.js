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

async function setValueToRank(summoners) {
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
                player.rank_val = 0;
                break;
        }

        // Logowanie wartości po przypisaniu
        console.log(`Player: ${player.nickname}, Tier: ${player.tier} (${player.tier_val}), Rank: ${player.rank} (${player.rank_val})`);
    }

    // Sortowanie według tier_val i rank_val
    summoners.sort((a, b) => {
        if (a.tier_val !== b.tier_val) {
            return b.tier_val - a.tier_val; // Najpierw sortuj malejąco według tier_val
        } else if (a.rank_val !== b.rank_val) {
            return a.rank_val - b.rank_val; // Następnie rosnąco według rank_val
        } else {
            return b.lp - a.lp; // Wreszcie, jeśli rank_val są równe, sortuj malejąco według lp
        }
    });
    
    return summoners;
}


function updateTable(summoners) {
    const tableBody = document.querySelector('.player');

    // Clear existing rows
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }

    summoners.forEach((player, index) => {
        const row = document.createElement('tr');
        row.classList.add('table-row');

        // Update region value
        if(player.region === "euw1"){
            player.region = "euw";
        } else {
            player.region = "eune";
        }

        // Create cells and populate them with the necessary data
        const placeCell = document.createElement('td');
        placeCell.classList.add('place');
        placeCell.textContent = `${index + 1}.`;

        const nicknameCell = document.createElement('td');
        nicknameCell.classList.add('nickname');
        const link = document.createElement('a');
        link.href = `https://lolchess.gg/profile/${player.region}/${player.nickname}-${player.tag}/set12`;
        link.target = "_blank";
        link.textContent = player.nickname;
        nicknameCell.appendChild(link);

        const tierCell = document.createElement('td');
        tierCell.classList.add('tier');
        const img = document.createElement('img');
        img.classList.add('tier-image');
        img.src = `images/Rank=${player.tier}.png`;
        img.alt = player.tier;
        tierCell.textContent = player.tier; // Add tier text
        tierCell.appendChild(img);

        const rankCell = document.createElement('td');
        rankCell.classList.add('rank');
        rankCell.textContent = player.rank;

        const lpCell = document.createElement('td');
        lpCell.classList.add('lp');
        lpCell.textContent = `${player.lp} lp`;

        // Append all cells to the row
        row.appendChild(placeCell);
        row.appendChild(nicknameCell);
        row.appendChild(tierCell);
        row.appendChild(rankCell);
        row.appendChild(lpCell);

        // Append the row to the table body
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
    const sorted_summoners = await setValueToRank(summoners_array_response);
    updateTable(sorted_summoners);
 }

main();
