// View Routes
//jshint esversion:8
const express = require("express");
const router = express.Router();
const alpha = require("alphavantage")({
    key: process.env.ALPHA_VANTAGE_KEY
});

const getOverview = require("../../helpers/getOverview");
const {
    ensureAuth
} = require("../../middleware/auth");

// @desc     View Page
// @route    GET /view/:symbol
// @access   Private
router.get("/:symbol", ensureAuth, async (req, res) => {
    const symbol = req.params.symbol;
    let data = await getOverview(symbol);
    let AssetType = data["AssetType"];
    let assetName = data["Name"];
    let assetExchange = data["Exchange"];
    let Currency = data['Currency'];
    let Country = data['Country'];
    let Sector = data['Sector'];
    let MarketCap = data['MarketCap'];
    let Ebitda = data['EBITDA'];
    let PERatio = data['PERatio'];

    // console.log(data);
    alpha.data
        .intraday(symbol)
        .then((data) => {
            const intraDay = data["Time Series (1min)"];
            
            const assetInformation = data["Meta Data"]['1. Information'];
            const lastRefreshed = data["Meta Data"]['3. Last Refreshed'];
            
            
            let dates = [];
            let opening = [];
            let closing = [];
            let highs = [];
            let lows = [];
            let volumes = [];
            const keys = Object.getOwnPropertyNames(intraDay);

            for (let i = 0; i < 100; i++) {
                dates.push(keys[i]);
                opening.push(intraDay[keys[i]]["1. open"]);
                highs.push(intraDay[keys[i]]["2. high"]);
                lows.push(intraDay[keys[i]]["3. low"]);
                closing.push(intraDay[keys[i]]["4. close"]);
                volumes.push(intraDay[keys[i]]["5. volume"]);
            }
            // reverse so dates appear from left to right
            dates.reverse();
            closing.reverse();
            //   dates = JSON.stringify(dates);
            //   closing = JSON.stringify(closing);
            res
                .status(200)
                .render(
                    "view", {symbol, data, dates, opening, closing, highs, lows, volumes, AssetType, assetName,assetExchange,Currency,Country,Sector,MarketCap,Ebitda,PERatio}
                );
        })
        .catch((err) => {
            // Handle the error
            console.log(err);
        });
});

module.exports = router;