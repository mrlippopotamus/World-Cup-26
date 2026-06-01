const API_KEY = "b3c19ad6e0ffa7b42033a2e2e1207c1a";

const WORLD_CUP_LEAGUE_ID = 1;
const SEASON = 2026;

const DEMO_MODE = true;

let displayedGroups = [];
let standingsIndex = 0;

document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

async function apiRequest(endpoint) {

    const response = await fetch(
        `https://v3.football.api-sports.io/${endpoint}`,
        {
            headers: {
                "x-apisports-key": API_KEY
            }
        }
    );

    return response.json();
}

function getCountdown(dateString) {

    const now = new Date();
    const kickoff = new Date(dateString);

    const diff = kickoff - now;

    if (diff <= 0) return "";

    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);

    return `Starts in ${hours}h ${mins}m`;
}

async function loadFixtures() {

    let fixturesData;

if (DEMO_MODE) {

    fixturesData = {
        response: [
            {
                fixture: {
                    date: "2026-06-17T18:00:00Z",
                    status: {
                        short: "NS",
                        long: "Not Started"
                    }
                },
                league: {
                    round: "Group A"
                },
                teams: {
                    home: {
                        name: "Mexico",
                        logo: "https://media.api-sports.io/football/teams/16.png"
                    },
                    away: {
                        name: "Poland",
                        logo: "https://media.api-sports.io/football/teams/1098.png"
                    }
                },
                goals: {
                    home: null,
                    away: null
                }
            }
        ]
    };

} else {

    fixturesData = await apiRequest(
        `fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${SEASON}`
    );

}

    const matchesContainer = document.getElementById("matches");
    matchesContainer.innerHTML = "";

    displayedGroups = [];

    const now = new Date();
    const next24 = new Date(now.getTime() + (24 * 60 * 60 * 1000));

const fixtures = fixturesData.response;
    );

    console.log(fixturesData);
    
    fixtures.sort(
    (a, b) =>
        new Date(a.fixture.date) -
        new Date(b.fixture.date)
);

    fixtures.forEach(match => {

        const group = match.league.round || "Group Stage";

        if (!displayedGroups.includes(group)) {
            displayedGroups.push(group);
        }

        const status = match.fixture.status.short;

        const kickoff = new Date(match.fixture.date)
    .toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit"
    });

        const score =
            status === "NS"
                ? "-"
                : `${match.goals.home} - ${match.goals.away}`;

        const card = document.createElement("div");
card.className = "match-card";

const isLive = ["1H", "2H", "HT", "ET", "BT", "P"].includes(
    match.fixture.status.short
);

if (isLive) {
    card.style.border = "3px solid #22c55e";
}

        card.innerHTML = `
            <div class="teams">
                <div>
                    <img src="${match.teams.home.logo}" width="50">
                    ${match.teams.home.name}
                </div>

                <div class="score">${score}</div>

                <div>
                    ${match.teams.away.name}
                    <img src="${match.teams.away.logo}" width="50">
                </div>
            </div>

            <div class="group">${group}</div>

            <div class="kickoff">
    Kick Off: ${kickoff}
</div>

            <div class="status">
    ${
        match.fixture.status.short === "NS"
            ? "Not Started"
            : `${match.fixture.status.long} ${match.fixture.status.elapsed || ""}'`
    }
</div>

            <div class="countdown">
                ${getCountdown(match.fixture.date)}
            </div>
        `;
        

        matchesContainer.appendChild(card);
    });
}

async function loadStandings() {

   let standingsData;

if (DEMO_MODE) {

    standingsData = {
        response: [
            {
                league: {
                    standings: [
                        [
                            {
                                group: "Group A",
                                team: { name: "Mexico" },
                                all: { played: 1 },
                                goalsDiff: 2,
                                points: 3
                            },
                            {
                                group: "Group A",
                                team: { name: "Poland" },
                                all: { played: 1 },
                                goalsDiff: 0,
                                points: 1
                            },
                            {
                                group: "Group A",
                                team: { name: "Japan" },
                                all: { played: 1 },
                                goalsDiff: -1,
                                points: 1
                            },
                            {
                                group: "Group A",
                                team: { name: "Senegal" },
                                all: { played: 1 },
                                goalsDiff: -1,
                                points: 0
                            }
                        ]
                    ]
                }
            }
        ]
    };

} else {

    standingsData = await apiRequest(
        `standings?league=${WORLD_CUP_LEAGUE_ID}&season=${SEASON}`
    );

}

    console.log("Standings Data:", standingsData);

    if (
        !standingsData.response ||
        standingsData.response.length === 0
    ) {

        document.getElementById("standings").innerHTML = `
            <div class="standings-card">
                <h3>No standings available yet</h3>
            </div>
        `;

        return;
    }

    if (!standingsData.response || standingsData.response.length === 0) {

    document.getElementById("standings").innerHTML = `
        <div class="standings-card">
            <h3>No standings available</h3>
        </div>
    `;

    return;
}

const groups =
    standingsData.response[0].league.standings;

    const standingsContainer =
    document.getElementById("standings");

    const relevantGroups = groups.filter(group => {

        const groupName = group[0].group;

        return displayedGroups.some(g =>
            groupName.includes(g.replace("Group ", ""))
        );
    });

    if (!relevantGroups.length) return;

    if (standingsIndex >= relevantGroups.length) {
        standingsIndex = 0;
    }

    const group = relevantGroups[standingsIndex];

    standingsContainer.innerHTML = `
        <div class="standings-card">
            <h3>${group[0].group}</h3>

            <table>
                <thead>
                    <tr>
                        <th>Team</th>
                        <th>P</th>
                        <th>GD</th>
                        <th>Pts</th>
                    </tr>
                </thead>

                <tbody>
                    ${group.map(team => `
                        <tr>
                            <td>${team.team.name}</td>
                            <td>${team.all.played}</td>
                            <td>${team.goalsDiff}</td>
                            <td>${team.points}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;

    standingsIndex++;
}

async function refreshDashboard() {

    try {

        await loadFixtures();
        await loadStandings();

    } catch (err) {

        console.error(err);
    }
}

refreshDashboard();

setInterval(refreshDashboard, 60000);
setInterval(loadStandings, 20000);
