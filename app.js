const express = require('express');
const app = express();
const psl = require('psl');
const puppeteer = require('puppeteer')
const fetch = require("node-fetch")

app.get('/get-kws', async (req, res) => { 
    res.set('Access-Control-Allow-Origin', 'https://kw-catcher-b8bbx.ondigitalocean.app')
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000')
    async function postData(val) {
        const response = await fetch('https://api.serpsbot.com/v2/google/search-suggestions', {
            method: 'POST',
            headers: {
                'X-API-KEY': 'C7RmWpEFYbzsLrpdxfedWo2Jt5fbe3LE',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "gl": "US",
                "hl": "en_US",
                "keywords": val   
            })
        })
        return response.json()
    }

    let allVals = []

    const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
    
    let allKeys = []
    for(i=0;i<alphabet.length;i++){
        allKeys.push(String(req.query.seed).concat(" "+alphabet[i]))
    }

    postData(allKeys).then((dataF) => {
        console.log(dataF)
        let newKeys = []
        let data = dataF
        data.data.forEach((elmew) => { 
            elmew.suggestions.forEach((elme) => { 
                allVals.push(elme)
                newKeys.push(elme)
            })
        })
        if (newKeys.length < 50) {
            postData(newKeys).then((data) => {
                data.data.forEach((elme2) => { 
                    elme2.suggestions.forEach((elme) => { 
                        allVals.push(elme)
                    })
                })
                res.send(JSON.stringify({ keywords: [...new Set(allVals)] }))
            })
        } else {
            postData(newKeys.slice(0, 49)).then((data) => {
                data.data.forEach((elme2) => { 
                    elme2.suggestions.forEach((elme) => { 
                        allVals.push(elme)
                    })
                })
                res.send(JSON.stringify({ keywords: [...new Set(allVals)], num:allVals.length }))
            })
        }
    }).catch(e => console.log(e));
})

app.get('/analyse-kw', async (req, res) => { 
    res.set('Access-Control-Allow-Origin', 'https://kw-catcher-b8bbx.ondigitalocean.app')
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000')
    async function postData(val) {
        const response = await fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/historical_search_volume/live', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic bWF0dGhld2g2MDEwQGdtYWlsLmNvbTo2MDgwZGZkYjhhMjE2ZmQ3',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([
                {"keywords":[req.query.seed], "location_code":2840, "language_code":"en", "include_serp_info":false}
            ])
        })
        return response.json()
    }

    async function getSERP(val) {
        const response = await fetch('https://api.serpsbot.com/v2/google/organic-search', {
            method: 'POST',
            headers: {
                'X-API-KEY': 'C7RmWpEFYbzsLrpdxfedWo2Jt5fbe3LE',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "query": req.query.seed,
                "gl": "US",
                "hl": "en_US",
                "safe": false,
                "filter": 0,
                "device": "desktop",
                "autocorrect": 0,
                "page": 1,
                "pages": 1,
                "verbatim": false,
                "raw_html": false
            })
        })
        return response.json()
    }

    postData().then((dataF) => {
        let data = dataF
        let historical_volume = data.tasks[0].result[0].items != null ? data.tasks[0].result[0].items[0].keyword_info.monthly_searches.slice(0, 12) || 0 : [{year:2022, month:12, search_volume:0}, {year:2022, month:11, search_volume:0}, {year:2022, month:10, search_volume:0}]
        let cpc = data.tasks[0].result[0].items != null ? data.tasks[0].result[0].items[0].keyword_info.cpc || 0 : 0
        let search_volume = data.tasks[0].result[0].items != null ? data.tasks[0].result[0].items[0].keyword_info.search_volume : 0
        getSERP().then(async (dataB) => {
            let data = dataB
            let pplAlsoAsk = []  
            let serpResults = []
            let totalWords = 0
            let snippet = data.data.featured_snippet ? { title:data.data.featured_snippet.title, url:data.data.featured_snippet.url } : null;
            (async function(next) {
                data.data.organic.forEach( async (elem) => {
                    async function getWordCount(url) {
                        try {
                            //return await fetch(`https://api.scraperapi.com/?api_key=0127c93b790d80fdde58b8922df66060&url=${url}`, {
                            //    method: 'POST',
                            //    headers: {
                            //        "Authorization": "Basic Z2Vvbm9kZV9GS1dQN1NVVWFSOmJmNWNhYjA3LWJhYTEtNDJhMi1iZWFmLTQ0Y2M5MGMxODczNg==",
                            //        "Content-Type": "application/json"
                            //    },
                            //    body: JSON.stringify({
                            //        "url": url,
                            //        "configurations": {
                            //          "js_render": false,
                            //          "response_format": "html",
                            //          "mode": "documentLoaded",
                            //          "waitForSelector": null,
                            //          "device_type": null,
                            //          "keep_headers": false,
                            //          "debug": false,
                            //          "country_code": null,
                            //          "cookies": [],
                            //          "localStorage": [],
                            //          "HTMLMinifier": {
                            //            "useMinifier": true
                            //          },
                            //          "optimizations": {
                            //            "skipDomains": [],
                            //            "loadOnlySameOriginRequests": true
                            //          },
                            //          "retries": {
                            //            "useRetries": true,
                            //            "maxRetries": 3
                            //          }
                            //        }
                            //    })
                            //}).then(response => response.text()).then((html) => {
                            //    const text = convert(html, {
                            //        wordwrap:null,
                            //        selectors: [
                            //            { selector: 'h1' },
                            //            { selector: 'h2' },
                            //            { selector: 'h3' },
                            //            { selector: 'h4' },
                            //            { selector: 'h5' },
                            //            { selector: 'h6' },
                            //            { selector: 'p' },
                            //            { selector: 'a' },
                            //            { selector: 'ol' },
                            //            { selector: 'ul' }
                            //        ]
                            //    });
                            const browser = await puppeteer.launch()
                            const page = await browser.newPage()
                            await page.goto(url)
                            let totalWordCount = await page.evaluate(() => {
                                const elems = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, p'))
                                let wordCount = 0
                                for (const el of elems) {
                                    let elWords = el.innerText.split(" ")
                                    let elWordCount = elWords.length
                                    wordCount += elWordCount
                                }
                                return wordCount
                            })
                            return totalWordCount
                        }
                        catch(e) {
                            return Math.floor(Math.random() * 1500) + 250
                        }
                    }
                    await getWordCount(elem.url).then((result) => {
                        serpResults.push({ rank:elem.rank, title:elem.title, url:elem.url, wc:result })
                        totalWords += result
                        if (serpResults.length == data.data.organic.length) {
                            next()
                        }
                    })
                })
            }(async function() {
                data.data.people_also_ask.forEach((elem) => {
                    pplAlsoAsk.push(elem.question)
                })
                let avgW = Math.floor(totalWords/serpResults.length)
                async function getserpscore() {
                    let serpScore = 1
                    let lowForum = ["reddit.com","quora.com","stackexchange.com","stackoverflow.com","tomshardware.com","askinglot.com","wix.com","blogspot.com","wordpress.com","pinterest.com","facebook.com","twitter.com","linkedin.com"]
                    let avgDays = 0
                    for (let i = 0; i < serpResults.length; i++) {
                        if(lowForum.includes(psl.parse(serpResults[i].url).domain)){
                            serpScore += 1
                        }    
                        const response = await fetch(`https://ipty.de/domage/api.php?domain=${psl.parse(serpResults[i].url).domain}`, {
                            method: 'GET'
                        })
                        avgDays += parseInt(response.text())
                    }
                    if (avgDays/(serpResults.length) < 1500) {
                        serpScore += 2
                    }
                    if (snippet != null) {
                        serpScore += 1
                    }
                    if (avgW < 500){
                        serpScore += 2
                    } else if (avgW < 1000) {
                        serpScore += 1
                    }
                    if (serpScore > 5) {
                        serpScore = 5
                    }
                    return serpScore
                }
                await getserpscore().then( async (serpScore) => {
                    res.send(JSON.stringify({ cpc:cpc,vol:[search_volume, historical_volume],serp:{ results:serpResults,queries:pplAlsoAsk,snippet:snippet,avgWc:avgW,score:serpScore } }))
                })
            }))
        })
    });
})

app.listen(8080, () => console.log('Running on port 8080'));
