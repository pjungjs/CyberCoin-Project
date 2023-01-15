
const BASE_URL = "https://api.coincap.io/v2";

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

const lastPrice = {};
coinLiveData();
// setInterval(coinLiveData, 1000);
// setTimeout(coinLiveData, 3000);
async function coinLiveData() {
    await fetch("https://api.coincap.io/v2/assets")
    .then(response => response.json())
    .then(result => {
        const currentTime = convertUnixTimestamp(result.timestamp);
        const timeWithoutSec = currentTime.slice(0, 15) + " " + currentTime.slice(19);

        const caption = document.querySelector("table caption");
        const tableHead = document.querySelector("thead");
        const tableBody = document.querySelector("tbody");

        caption.textContent = `Live Updates: ${currentTime}`;
        tableHead.innerHTML = `
        <tr>
            <th class="coin rank">Rank</th>
            <th class="coin name">Coin</th>
            <th class="coin price">Price</th>
            <th class="coin marketCap">Market Cap</th>
            <th class="coin volumeOneDay">Volume 24hr</th>
            <th class="coin changeOneDay">Change % 24hr</th>
        </tr>
        `;

        if(tableBody.innerText.length > 0) {        
            //e.firstElementChild can be used.
            let child = tableBody.firstChild; 
            while (child) {
                tableBody.removeChild(child);
                child = tableBody.firstChild;
            }
            
        }
        for (let i = 0; i < result.data.length; i++) {
            const { id, rank, name, priceUsd, symbol, explorer, vwap24Hr, marketCapUsd, volumeUsd24Hr, changePercent24Hr } = result.data[i];
            const arrOfPrices = [Number(priceUsd).toLocaleString("en-US"), Number(marketCapUsd).toLocaleString("en-US"), Number(volumeUsd24Hr).toLocaleString("en-US"), Number(changePercent24Hr).toLocaleString("en-US")];

            // <td class="coin names">
            //     <img class="coin img-fluid" alt="logo" src="./assets/crypto-img-202301/aave-aave-logo.png" width="30">
            //     <p class="coin name">${name}</p>
            //     <p class="coin symbol"><small>${symbol}</small></p>
            // </td>

            const tr = document.createElement("tr")
            tr.classList.toggle(`row${i}`);
            tr.innerHTML = `
            <td class="coin rank">${rank}</td>
            <td class="coin names"><a href="${explorer}" target="_blank" rel="noopener noreferrer">${name}</a></td>
            <td class="coin price" style="color:${priceChangeColor(lastPrice[i], priceUsd)};">$ ${arrOfPrices[0]}</td>
            <td class="coin marketCap" ${priceChangeColor(lastPrice[i], marketCapUsd)};">$ ${arrOfPrices[1]}</td>
            <td class="coin volumeOneDay" ${priceChangeColor(lastPrice[i], volumeUsd24Hr)}};">$ ${arrOfPrices[2]}</td>
            <td class="coin changeOneDay" ${priceChangeColor(lastPrice[i], changePercent24Hr)};">${arrOfPrices[3]}%</td>
            `;
            tableBody.appendChild(tr);
            
            tr.addEventListener("click", event => {
                event.preventDefault;
                // console.log(event.target) // logs clicked td element
                // console.log(event.target.getAttribute("class")) // logs clicked element's class
                console.log(event.path[1].getAttribute("class")) // logs clicked table row's class
            });

            lastPrice[i] = arrOfPrices[0];
            
            // src="./assets/crypto-img-202301/bitcoin-btc-logo.png"
            /** <a href="#" target="_blank" rel="noopener noreferrer">${name}</a>
             * Setting it to "noopener noreferrer" is to prevent a type of phishing known as tabnabbing. **/
        }
        console.log(lastPrice)
        
        function priceChangeColor(lastPrice, price) {
            !lastPrice || lastPrice === price ? "black" : price > lastPrice ? "green" : "red";
        }
    })
    .catch((error) => alert(error));
}
