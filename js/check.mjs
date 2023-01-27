const fs = require('fs');
const folderPath = "../assets/crypto-img-png";
const nameData = "bitcoin-btc";

export const findImg = function checkFile(nameData) {
    const files = fs.readdir(folderPath);
    for (let i = 0; i < files.length; i++) {
        if (files[i].includes(nameData)) {
            const path = folderPath + files[i];
            console.log(path)
            return path;
        }
    }
};
