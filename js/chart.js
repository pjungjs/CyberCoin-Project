// //IMPORT the Coin Data Base built upon the API data.
// import { coinDataBase, resetTableContent } from "./main.js";

const BASE_URL = "https://api.coincap.io/v2";
const coinDataBase = {};

const chartBox = document.querySelector(".chartBox h3");
const myChart = document.querySelector("#myChart");
const formSearch = document.querySelector(".submitAll");
const formReset = document.querySelector(".reset");
const formSelect = document.querySelector(".form-select");


async function coinLiveData() {
    await fetch(`${BASE_URL}/assets`)
    .then(response => response.json())
    .then(result => {
        for (let i = 0; i < result.data.length; i++) {
            const { id, rank, name, priceUsd, symbol, explorer, vwap24Hr,
                marketCapUsd, volumeUsd24Hr, changePercent24Hr } = result.data[i];

            //adding data to the Coin Data Base.
            coinDataBase[symbol] = id;
        }
    })
    .catch((error) => console.log(error));
}


coinLiveData();


formSearch.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    //get the user's values, and access the data base.
    const userCoinSymbol = event.target.coinSymbol.value.toUpperCase();
    const userTime = event.target.time.value;
    const userCoinId = coinDataBase[userCoinSymbol];

    if(!userCoinId) {
        return alert("Cryptocurrency Not Found!");
    }

    //show the history of the coin desired by the user.
    await history(userCoinSymbol, userCoinId, userTime);
});


async function history(userCoinSymbol, userCoinId, userTime) {
    await fetch(`https://api.coincap.io/v2/assets/${userCoinId}/history?interval=${userTime}`)
    .then(response => response.json())
    .then(result => {
        const arrOfData = [];

        for (let i=0; i < result.data.length; i++) {
            const { circulatingSupply, date, priceUsd, time } = result.data[i];
            arrOfData.push({ time: time/1000, value: Number(priceUsd).toFixed(6) });   
        }

        chartBox.textContent = "Line Chart Graphic";

        //will show up to 5 charts. lenght greater than 12 because 3 elements * 4 times.
        //the first time will show as length of 0, but by the time it reaches 5 charts, it will be length of 12.
        if(myChart.children.length > 12) {
            document.querySelector("#myChart br").remove()
            document.querySelector("#myChart p").remove()
            document.querySelector("#myChart .tv-lightweight-charts").remove();
        }

        //this will show the text inside of the option selected.
        const text = formSelect.options[formSelect.selectedIndex].text;
        const p = document.createElement("p");
        const br = document.createElement("br");
        p.textContent = `${userCoinSymbol} (${userCoinId}): ${text}`;
        myChart.append(br, p);
        
        createChart(arrOfData);
    })
    .catch((error) => console.log(error));
}


function createChart(arrOfData) {
    const chartOptions = {
        localization: {
            dateFormat: 'MM/dd/yyyy',
            priceFormatter: function(price) {
                return '$' + price.toLocaleString("en-US");
            },
        }, width: 1000, height: 400
    };
    const chart = LightweightCharts.createChart(myChart, chartOptions);
    const lineSeries = chart.addLineSeries();
    lineSeries.setData(arrOfData);
    chart.timeScale().fitContent();
    chart.applyOptions({
        timeScale: {
            rightOffset: 12,
            barSpacing: 3,
            fixLeftEdge: true,
            lockVisibleTimeRangeOnResize: true,
            rightBarStaysOnScroll: true,
            borderVisible: false,
            borderColor: '#fff000',
            visible: true,
            timeVisible: true,
            secondsVisible: true,
        },
    });
}


formReset.addEventListener("click", async (event) => {
    event.preventDefault();

    chartBox.textContent = "";

    if(myChart.innerText) {
        let firstChart = myChart.firstChild;
        while (firstChart) {
            // myChart.removeChild(firstChart);
            myChart.firstChild.remove();
            firstChart = myChart.firstChild;
        }
    }
});