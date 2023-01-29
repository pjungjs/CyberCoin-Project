// //EXPORT the Coin Data Base built upon the API data.
// export { coinDataBase, resetTableContent };

const BASE_URL = "https://api.coincap.io/v2";
const coinDataBase = {};

//the reference for "priceChangeColor" function later.
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
    // const milliseconds = date * 1000; 
    // const humanDateFormat = new Date(milliseconds);
    // return humanDateFormat;
    return new Date(date).toLocaleString();
}

//the reference for "priceChangeColor" function later.
let num = 0;

const tableHead = document.querySelector("thead");
const tableBody = document.querySelector("tbody");
const caption = document.querySelector("table caption");

coinLiveData();
setInterval(coinLiveData, 3000);
async function coinLiveData() {
    await fetch(`${BASE_URL}/assets`)
    .then(response => response.json())
    .then(result => {
        const currentTime = convertUnixTimestamp(result.timestamp);
        const timeWithoutSec = currentTime.slice(0, 15) + " " + currentTime.slice(19);

        caption.textContent = `Last Updated: ${currentTime} - Updating every 3 seconds.`;
       
        if(tableHead && tableHead.children.length === 0) {
            const thCoinRank = document.createElement("td");
            thCoinRank.setAttribute("class", "coin rank");
            thCoinRank.textContent = "Rank";
            
            const thCoinName = document.createElement("td");
            thCoinName.setAttribute("class", "coin name");
            thCoinName.textContent = "Coin";
            
            const thCoinPrice = document.createElement("td");
            thCoinPrice.setAttribute("class", "coin price");
            thCoinPrice.textContent = "Price";
            
            const thCoinMarketCap = document.createElement("td");
            thCoinMarketCap.setAttribute("class", "coin marketCap");
            thCoinMarketCap.textContent = "Market Cap";

            const thCoinVolumeOneDay = document.createElement("td");
            thCoinVolumeOneDay.setAttribute("class", "coin volumeOneDay");
            thCoinVolumeOneDay.textContent = "Volume 24hr";

            const thCoinChangeOneDay = document.createElement("td");
            thCoinChangeOneDay.setAttribute("class", "coin changeOneDay");
            thCoinChangeOneDay.textContent = "Change % 24hr";

            tableHead.append(thCoinRank, thCoinName, thCoinPrice, thCoinMarketCap, thCoinVolumeOneDay, thCoinChangeOneDay);
        }

        //reset whole table content if there's any.
        resetTableContent();

        for (let i = 0; i < result.data.length; i++) {
            const { id, rank, name, priceUsd, symbol, explorer, vwap24Hr,
                marketCapUsd, volumeUsd24Hr, changePercent24Hr } = result.data[i];
            const arrOfPrices = [
                Number(priceUsd).toFixed(6),
                Number(marketCapUsd).toLocaleString("en-US"),
                Number(volumeUsd24Hr).toLocaleString("en-US"),
                Number(changePercent24Hr).toLocaleString("en-US")
            ];
            
            //adding data to the Coin Data Base.
            coinDataBase[symbol] = id;

            //the reference for "priceChangeColor" function later.
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
            
            const tr = document.createElement("tr");
            
            const tdCoinRank = document.createElement("td");
            tdCoinRank.setAttribute("class", "coin rank");
            tdCoinRank.textContent = rank;
            
            const tdCoinName = document.createElement("td");
            const tdCoinNameLink = document.createElement("a");
            tdCoinName.setAttribute("class", "coin name");
            tdCoinNameLink.setAttribute("href", explorer);
            tdCoinNameLink.setAttribute("target", "_blank");
            tdCoinNameLink.setAttribute("rel", "noopener noreferrer");
            tdCoinNameLink.textContent = name;
            tdCoinName.textContent = ` (${symbol})`;
            
            const tdCoinPrice = document.createElement("td");
            tdCoinPrice.setAttribute("class", "coin price");
            tdCoinPrice.setAttribute("style", `color:${priceChangeColor(lastPrice[i], currPrice[i])}`);
            tdCoinPrice.textContent = `$ ${arrOfPrices[0]}`;
            
            const tdCoinMarketCap = document.createElement("td");
            tdCoinMarketCap.setAttribute("class", "coin marketCap");
            tdCoinMarketCap.setAttribute("style", `color:${priceChangeColor(lastMarketCap[i], currMarketCap[i])}`);
            tdCoinMarketCap.textContent = `$ ${arrOfPrices[1]}`;

            const tdCoinVolumeOneDay = document.createElement("td");
            tdCoinVolumeOneDay.setAttribute("class", "coin volumeOneDay");
            tdCoinVolumeOneDay.setAttribute("style", `color:${priceChangeColor(lastVolume24[i], currVolume24[i])}`);
            tdCoinVolumeOneDay.textContent = `$ ${arrOfPrices[2]}`;

            const tdCoinChangeOneDay = document.createElement("td");
            tdCoinChangeOneDay.setAttribute("class", "coin changeOneDay");
            tdCoinChangeOneDay.setAttribute("style", `color:${priceChangeColor(lastChangePercent[i], currChangePercent[i])}`);
            tdCoinChangeOneDay.textContent = `${arrOfPrices[3]} %`;

            tableBody.appendChild(tr);
            tdCoinName.prepend(tdCoinNameLink)
            tr.append(tdCoinRank, tdCoinName, tdCoinPrice, tdCoinMarketCap, tdCoinVolumeOneDay, tdCoinChangeOneDay);
        }

        //the reference for "priceChangeColor" function later.
        if(num === 0 || num === 2) {
            num = 1;
        } else if(num === 1) {
            num = 2;
        }
    })
    .catch((error) => console.log(error));
}


function resetTableContent() {
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