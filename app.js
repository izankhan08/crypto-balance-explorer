// Universal Data ----------------------------------------------------------------------
const data = {
    polygon: {
        apiKey: "X1QIYHSGZWGNAQB8PPGIWSFEQ67H5EV9S9",
        tokens: {
            USDT: {
                tokenAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
                decimal: 0.000001
            },
            USDC: {
                tokenAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
                decimal: 0.000001
            },
            Matic: {
                tokenAddress: "0x0000000000000000000000000000000000001010",
                decimal: 0.000000000000000001
            }
        }
    },
    ethereum: {
        apiKey: "N6AAJCSUEIX8X1FVJMH9DR34HJQ6QGAU5P",
        tokens: {
            USDT: {
                tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
                decimal: 0.000001
            },
            USDC: {
                tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                decimal: 0.000001
            },
            Matic: {
                tokenAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
                decimal: 0.000000000000000001
            }

        }
    }
}

// Universal Elements ----------------------------------------------------------------------

// Universal Variables -----------------------------------------------------------------------
let tableCreated = 0;
let allTableObject = [];

// Input to array function ---------------------------------------------------------------------
async function inptStringToArrayAndGetBalAndTableObjectBuild(fullString, chain, coin) {
    let tableObject = [];
    let lastIdx = 0;
    const strSize = fullString.length;
    for (let i = 0; i < strSize; i++) {
        if (fullString[i] == "," || fullString[i] == " " || fullString[i] == "\n" || fullString[i] == "\t") {
            let address = fullString.substring(lastIdx, i);
            address = address.trim();
            lastIdx = i + 1;
            if (address == "" || address == " ") continue;
            const amount = await getBalance(address, chain, coin);
            if (amount == -1) {
                const h3 = document.createElement("h3");
                // Use toastify 
                h3.innerText = `Something went wrong for wallet address: ${address}`;
                errorcontainer.append(h3);
            } else {
                tableObject.push({ "address": `${address}`, "coin": `${coin}`, "chain": `${chain}`, "amount": `${amount}` });
                progressor.innerText++;
            }
        }
    }
    let address = fullString.substring(lastIdx, strSize);
    address = address.trim();
    if (!(address == "" || address == " ")) {
        const amount = await getBalance(address, chain, coin);
        if (amount == -1) {
            const h3 = document.createElement("h3");
            // Use toastify 
            h3.innerText = `Something went wrong for wallet address: ${address}`;
            errorcontainer.append(h3);
        } else {
            tableObject.push({ "address": `${address}`, "coin": `${coin}`, "chain": `${chain}`, "amount": `${amount}` });
            progressor.innerText++;
        }
    }
    allTableObject.push(...tableObject);
    createTable(tableObject);
    progressor.innerText = 0;
}

// API Calls with get Balance Function -------------------------------------------------------------------
async function getBalance(address, chain, coin) {
    try {
        const coinAddress = data[chain].tokens[coin].tokenAddress;
        if (chain == "ethereum") {
            url = `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${coinAddress}&address=${address}&tag=latest&apikey=${data[chain].apiKey}`;
        }
        else {
            url = `https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${coinAddress}&address=${address}&tag=latest&apikey=${data[chain].apiKey}`;
        }
        const gotVal = await axios.get(url);
        if (gotVal.data.status == 1) {
            return (gotVal.data.result * data[chain].tokens[coin].decimal);
        }
        else {
            return -1;
        }
    } catch (error) {
        return -1;
    }
}

inputBar.addEventListener("keydown", (key) => {
    if (key.key === "Enter") {
        btn.click();
    }
});

// Fetch Event handler ----------------------------------------------------------------------------
btn.addEventListener("click", async () => {
    inputBar.disabled = true;
    inputContainer.classList.add("inptDisabled");

    load.classList.remove("dispNone");
    loadElem.classList.remove("anim-stop");
    getAmntsLoader.classList.remove("dispHidden");
    resetBtn.classList.add("dispNone");

    await inptStringToArrayAndGetBalAndTableObjectBuild(inputBar.value, chain.value, coin.value);
    inputBar.value = "";
    inputBar.dispatchEvent(new Event('input'));

    getAmntsLoader.classList.add("dispHidden");
    load.classList.add("dispNone");
    loadElem.classList.add("anim-stop");
    inputBar.disabled = false;
    inputContainer.classList.remove("inptDisabled");
})

// Create table Function --------------------------------------------------------------------------
function createTable(tableObject, sorted = false) {
    tableObject.map((object) => {
        if (!tableCreated) {
            table.classList.remove("dispNone"), btnCopyTable.classList.remove("dispNone"), exportTable.classList.remove("dispNone");
            tableCreated = 1;
        }
        if (sorted) {
            tbody.innerHTML = "";
            sorted = false;
        }
        const chainName = object.chain.charAt(0).toUpperCase() + object.chain.slice(1);
        const tr = document.createElement("tr");
        tr.innerHTML = `<td> ${object.address} </td>
                        <td> <b> ${object.amount} </b> </td>
                        <td> ${object.coin} </td> 
                        <td> ${chainName} </td>`;
        tbody.appendChild(tr);
    })
}

// Sort Table ---------------------------------------------------------------------------------------------

let toggleSorted = 0;
sortAmt.addEventListener('click', () => {
    let array = allTableObject;
    if (toggleSorted) {
        array.sort((a, b) => {
            return parseFloat(a.amount) - parseFloat(b.amount);
        });
    }
    else {
        array.sort((a, b) => {
            return parseFloat(b.amount) - parseFloat(a.amount);
        });
    }

    toggleSorted = !toggleSorted;
    createTable(array, true);
})

sortCoin.addEventListener('click', () => {
    let array = allTableObject;
    if (toggleSorted) {
        array.sort((a, b) => {
            if (a.coin > b.coin)
                return 1;
            else {
                return -1;
            }
        });
    }
    else {
        array.sort((a, b) => {
            if (a.coin < b.coin)
                return 1;
            else {
                return -1;
            }
        });
    }
    toggleSorted = !toggleSorted;
    createTable(array, true);
})

sortChain.addEventListener('click', () => {
    let array = allTableObject;
    if (toggleSorted) {
        array.sort((a, b) => {
            if (a.chain > b.chain)
                return 1;
            else {
                return -1;
            }
        });
    }
    else {
        array.sort((a, b) => {
            if (a.chain < b.chain)
                return 1;
            else {
                return -1;
            }
        });
    }
    toggleSorted = !toggleSorted;
    createTable(array, true);
})

// Export table feature -----------------------------------------------------------------
exportTable.addEventListener('click', () => tableToCSV());
const tableToCSV = async () => {
    try {
        let csvData = [];
        const rows = document.querySelectorAll("tr");
        for (let row of rows) {
            let cols = row.querySelectorAll("th,td");
            let csvRow = [];
            for (let col of cols) {
                csvRow.push(col.innerText);
            };
            csvData.push(csvRow.join(","));
        };
        csvData = csvData.join("\n");

        const blob = new Blob([csvData], { type: 'text/csv' });

        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'TokenBalances.csv';

        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        alert("Error " + error + " Occured");
    }
}

// Copy Table Feature -------------------------------------------------------------------
btnCopyTable.addEventListener('click', () => copyEl());
const copyEl = async () => {
    const elToBeCopied = document.querySelector('table');
    try {
        await navigator.clipboard.writeText(elToBeCopied.innerText);
        alert("Table copied to clipboard");
    } catch (err) {
        alert("Something went wrong");
    }
};

// Connect Button feature -------------------------------------------------------------------------
connectBtn.addEventListener("click", () => {
    window.location.href = 'https://www.linkedin.com/in/awezmirza/';
})

// Paste In inputbar feature --------------------------------------------------------
pasteBtn.addEventListener("click", () => {
    navigator.clipboard.readText()
        .then((copiedText) => {
            copiedText = copiedText.split('\n').join(' ');
            inputBar.value = copiedText;
            inputBar.dispatchEvent(new Event('input'));
        }).catch(err => {
            alert("Failed to read");
        });
})

// Reset Inputbar feature -----------------------------------------------------------
resetBtn.addEventListener("click", () => {
    inputBar.value = "";
    inputBar.dispatchEvent(new Event('input'));

})

// Show Reset button Feature ----------------------------------------------------------
inputBar.addEventListener("input", (event) => {
    const text = event.target.value;
    if (text) {
        pasteBtn.classList.add("dispNone");
        resetBtn.classList.remove("dispNone");
    }
    else {
        pasteBtn.classList.remove("dispNone");
        resetBtn.classList.add("dispNone");
    }
})

// Reset Errors -----------------------------------------------------------------
// errorcontainer.addEventListener("change", (event) => {
//     if (errorcontainer.innerHTML) {
//         clrerrorbtn.classList.remove("dispHidden");
//     }
//     else {
//         clrerrorbtn.classList.add("dispHidden");
//     }
// })

clrerrorbtn.addEventListener("click", () => {
    errorcontainer.innerHTML = "";
})

