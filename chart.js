//IMPORT the Coin Data Base built upon the API data.
import { coinDataBase, resetTableContent } from "./main.js";

const formSearch = document.querySelector(".submitAll");
formSearch.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    //get the user's values, and access the data base.
    const userCoinSymbol = event.target.coinSymbol.value;
    const userTime = event.target.time.value;
    const userCoinId = coinDataBase[userCoinSymbol.toUpperCase()];

    if(!userCoinId) {
        return alert("Cryptocurrency Not Found!");
    }

    //remove whole table.
    const caption = document.querySelector("table caption");
    const tableHead = document.querySelector("thead");
    if(caption || tableHead) {
        caption.remove();
        tableHead.remove();
    }
    resetTableContent();

    const chartBox = document.querySelector(".chartBox h3");
    chartBox.textContent = "Line Chart Graphic";

    //show the history of the coin desired by the user.
    await history(userCoinId, userTime);
});


async function history(userCoinId, userTime) {
    await fetch(`https://api.coincap.io/v2/assets/${userCoinId}/history?interval=${userTime}`)
    .then(response => response.json())
    .then(result => {
        // alert("Work in progress")
        const arrOfData = [];
        for (let i=0; i < result.data.length; i++) {
            const { circulatingSupply, date, priceUsd, time } = result.data[i];
            arrOfData.push({ time: time, value: priceUsd });         
        }
        createChart(arrOfData);
    })
    .catch((error) => console.log(error));
}


async function createChart(arrOfData) {
    const canvas = document.getElementById("myChart");
    const chart = LightweightCharts.createChart(canvas, { width: 1000, height: 600 });
    const lineSeries = chart.addLineSeries();
    await lineSeries.setData(arrOfData);
}


const formReset = document.querySelector(".reset");
formReset.addEventListener("click", async (event) => {
    event.preventDefault();

    document.querySelector(".chartBox h3").textContent = "";

    const chart = document.querySelector("#myChart");
    if(chart.innerText) {
        let firstChart = chart.firstChild;
        while (firstChart) {
            chart.firstChild.remove();
            // chart.removeChild(firstChart);
            firstChart = chart.firstChild;
        }
    }
});