// import { findImg } from "./check.mjs";
const BASE_URL = "https://api.coincap.io/v2";

//the Coin Data Base built upon the API data.
const coinDataBase = {};

const lastPrice = [];
const currPrice = [];
const lastMarketCap = [];
const currMarketCap = [];
const lastVolume24 = [];
const currVolume24 = [];
const lastChangePercent = [];
const currChangePercent = [];

//convert a Unix Timestamp into a human-readable date.
function convertUnixTimestamp(date) {
/* A JavaScript date is fundamentally specified as the number of milliseconds 
that have elapsed since the ECMAScript epoch, 
which is defined as the midnight at the beginning of January 1, 1970, UTC 
(equivalent to the UNIX epoch). */
    return new Date(date).toLocaleString();
    // const milliseconds = date * 1000; 
    // const humanDateFormat = new Date(milliseconds);
    // return humanDateFormat;
}

// const formLive = document.querySelector(".live");
// formLive.addEventListener("click", (event) => {
//     event.preventDefault();
// });

// coinLiveData();
setInterval(coinLiveData, 3000);
let num = 0;
async function coinLiveData() {
    await fetch(`${BASE_URL}/assets`)
    .then(response => response.json())
    .then(result => {
        const currentTime = convertUnixTimestamp(result.timestamp);
        const timeWithoutSec = currentTime.slice(0, 15) + " " + currentTime.slice(19);

        const caption = document.querySelector("table caption");
        const tableHead = document.querySelector("thead");
        const tableBody = document.querySelector("tbody");

        caption.textContent = `Last Updated: ${currentTime} - Updating every 3 seconds.`;
        tableHead.innerHTML = `
        <tr>
            <th class="th coin rank">Rank</th>
            <th class="th coin name">Coin</th>
            <th class="th coin price">Price</th>
            <th class="th coin marketCap">Market Cap</th>
            <th class="th coin volumeOneDay">Volume 24hr</th>
            <th class="th coin changeOneDay">Change % 24hr</th>
        </tr>
        `;

        //reset whole table if there's any.
        resetTable();

        for (let i = 0; i < result.data.length; i++) {
            const { id, rank, name, priceUsd, symbol, explorer, vwap24Hr,
                marketCapUsd, volumeUsd24Hr, changePercent24Hr } = result.data[i];
            const arrOfPrices = [
                Number(priceUsd).toFixed(6),
                Number(marketCapUsd).toLocaleString("en-US"),
                Number(volumeUsd24Hr).toLocaleString("en-US"),
                Number(changePercent24Hr).toLocaleString("en-US")
            ];

            //adding data to the Coin Data Base
            coinDataBase[symbol] = id;
            
            if(num === 0) {
                lastPrice[i] = priceUsd;
                lastMarketCap[i] = marketCapUsd;
                lastVolume24[i] = volumeUsd24Hr;
                lastChangePercent[i] = changePercent24Hr;
            } else if(num === 1) {
                currPrice[i] = priceUsd;
                currMarketCap[i] = marketCapUsd;
                currVolume24[i] = volumeUsd24Hr;
                currChangePercent[i] = changePercent24Hr;
            } else if(num === 2) {
                lastPrice[i] = currPrice[i];
                lastMarketCap[i] = currMarketCap[i];
                lastVolume24[i] = currVolume24[i];
                lastChangePercent[i] = currChangePercent[i];
                currPrice[i] = priceUsd;
                currMarketCap[i] = marketCapUsd;
                currVolume24[i] = volumeUsd24Hr;
                currChangePercent[i] = changePercent24Hr;
            }

            // <td class="coin name">
            //     <img class="coin img-fluid" alt="logo" src="../assets/crypto-img/bitcoin-btc-logo.png" width="30">
            // </td>
            /** <a href="#" target="_blank" rel="noopener noreferrer">${name}</a>
            * Setting it to "noopener noreferrer" is to prevent a type of phishing known as tabnabbing. **/

            const tr = document.createElement("tr")
            tr.classList.toggle(`row${i}`);
            tr.innerHTML = `
            <td class="coin rank">${rank}</td>
            <td class="coin name">
                <img class="coin img-fluid" alt="logo" src="../assets/crypto-img/bitcoin-btc-logo.png" width="30">
                <a href="${explorer}" target="_blank" rel="noopener noreferrer">${name}</a> (${symbol})
            </td>
            <td class="tb coin price" style="color:${priceChangeColor(lastPrice[i], currPrice[i])};">$ ${arrOfPrices[0]}</td>
            <td class="tb coin marketCap" style="color:${priceChangeColor(lastMarketCap[i], currMarketCap[i])};">$ ${arrOfPrices[1]}</td>
            <td class="tb coin volumeOneDay" style="color:${priceChangeColor(lastVolume24[i], currVolume24[i])}};">$ ${arrOfPrices[2]}</td>
            <td class="tb coin changeOneDay" style="color:${priceChangeColor(lastChangePercent[i], currChangePercent[i])};">${arrOfPrices[3]}%</td>
            `;
            tableBody.appendChild(tr);

            tr.addEventListener("click", event => {
                event.preventDefault;
                // console.log(event.target) // logs clicked td element
                // console.log(event.target.getAttribute("class")) // logs clicked element's class
                // console.log(event.path[1].getAttribute("class")) // logs clicked table row's class
            });
        }

        if(num === 0 || num === 2) {
            num = 1;
        } else if(num === 1) {
            num = 2;
        }
    })
    .catch((error) => console.log(error));
}


function resetTable() {
    const tableBody = document.querySelector("tbody");
    if(tableBody.innerText.length > 0) {        
        let child = tableBody.firstChild; 
        while (child) {
            tableBody.removeChild(child);
            child = tableBody.firstChild;
        }
    }
}


function priceChangeColor(last, current) {
    return !current || last === current ? "black" : current > last ? "green" : "red";
}


const formSearch = document.querySelector(".submitAll");
formSearch.addEventListener("submit", (event) => {
    event.preventDefault();
    
    //get the user's values, and access the data base.
    const userCoinSymbol = event.target.coinSymbol.value;
    const userTime = event.target.time.value;
    const userCoinId = coinDataBase[userCoinSymbol.toUpperCase()];

    //remove whole table.
    const caption = document.querySelector("table caption");
    const tableHead = document.querySelector("thead");
    if(caption || tableHead) {
        caption.remove();
        tableHead.remove();
    }
    resetTable();

    //show the history of the coin desired by the user.
    history(userCoinId, userTime);
});


async function history(userCoinId, userTime) {
    await fetch(`https://api.coincap.io/v2/assets/${userCoinId}/history?interval=${userTime}`)
    .then(response => response.json())
    .then(result => {
        alert("Work in progress")
        const coinSearchPrice = [];
        const coinSearchTime = [];
        for (let i=0; i < result.data.length; i++) {
            const { circulatingSupply, date, priceUsd, time } = result.data[i];
            const currentTime = convertUnixTimestamp(time);

            coinSearchPrice.push(priceUsd);
            coinSearchTime.push(currentTime);
        }
        // console.log(coinSearchPrice, coinSearchTime)
        createChart(coinSearchPrice, coinSearchTime);
    })
    .catch((error) => alert(error));
}


function createChart(coinSearchPrice, coinSearchTime) {}