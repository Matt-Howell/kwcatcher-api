const express = require('express');
const app = express();
const psl = require('psl');
const puppeteer = require('puppeteer')
const fetch = require("node-fetch")
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()

app.get('/get-kws', async (req, res) => { 
    res.set('Access-Control-Allow-Origin', 'https://beta.keywordcatcher.com')
    // res.set('Access-Control-Allow-Origin', 'http://localhost:3000')
    async function postData(val) {
        const response = await fetch('https://api.serpsbot.com/v2/google/search-suggestions', {
            method: 'POST',
            headers: {
                'X-API-KEY': 'C7RmWpEFYbzsLrpdxfedWo2Jt5fbe3LE',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "gl": req.query.cc,
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
    res.set('Access-Control-Allow-Origin', 'https://beta.keywordcatcher.com')
    // res.set('Access-Control-Allow-Origin', 'http://localhost:3000')
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
                "gl": req.query.cc,
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
            console.log(dataB)
            let data = dataB
            let pplAlsoAsk = []  
            let serpResults = []
            let totalWords = 0
            let snippet = data.data.featured_snippet ? { title:data.data.featured_snippet.title, url:data.data.featured_snippet.url } : null;
            (async function(next) {
                data.data.organic.forEach( async (elem) => {
                    async function getWordCount(url) {
                        try {
                            const browser = await puppeteer.launch()
                            const page = await browser.newPage()
                            await page.goto(url)
                            let bodyHandle = await page.$('body');
                            let totalWordCount = (await page.evaluate(body => body.innerText, bodyHandle)).split(" ").length;
                            return totalWordCount
                        }
                        catch(e) {
                            console.log(e)
                            return 1245
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
                    let lowForum = ["reddit.com","quora.com","stackexchange.com","stackoverflow.com","tomshardware.com","askinglot.com","wix.com","blogspot.com","wordpress.com","pinterest.com","facebook.com","twitter.com","linkedin.com","yahoo.com",
                    "wordpress.org",
                    "github.com",
                    "tripadvisor.com",
                    "goodreads.com",
                    "steamcommunity.com",
                    "gamefaqs.com",
                    "xda-developers.com",
                    "myfitnesspal.com",
                    "webmd.com",
                    "babycenter.com",
                    "city-data.com",
                    "cruisecritic.com",
                    "houzz.com",
                    "theknot.com",
                    "weddingwire.com",
                    "ehealthforum.com",
                    "bodybuilding.com",
                    "tomshardware.com",
                    "avsforum.com",
                    "dslreports.com",
                    "fodors.com",
                    "bogleheads.org",
                    "chowhound.com",
                    "whirlpool.net.au",
                    "beeradvocate.com",
                    "winespectator.com",
                    "dpreview.com",
                    "dpreview.com",
                    "community.adobe.com",
                    "sketchup.com",
                    "unrealengine.com",
                    "blenderartists.org",
                    "autodesk.com",
                    "probrewer.com",
                    "homebrewtalk.com",
                    "androidcentral.com",
                    "crackberry.com",
                    "macrumors.com",
                    "imore.com",
                    "windowscentral.com",
                    "windowsforum.com",
                    "linuxquestions.org",
                    "raspberrypi.org",
                    "arduino.cc",
                    "avforums.com"]
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
                    if (avgW < 750){
                        serpScore += 2
                    } else if (avgW < 1250) {
                        serpScore += 1
                    }
                    if (serpScore > 5) {
                        serpScore = 5
                    }
                    return serpScore
                }
                await getserpscore().then( async (serpScore) => {
                      const configuration = new Configuration({
                        apiKey: process.env.OPENAI_API_KEY,
                      });

                      const openai = new OpenAIApi(configuration);
                      
                      await openai.createCompletion({
                        model: "text-davinci-003",
                        prompt: `Keyword: \"${req.query.seed}\". What would a good post title be? Give an outline for a post about this keyword, with subheadings & titles as a bullet list.`,
                        temperature: 0.01,
                        max_tokens: 412,
                        top_p: 1,
                        frequency_penalty: 0,
                        presence_penalty: 0,
                        stop: ["---"],
                      }).then(aiserp => res.send(JSON.stringify({ cpc:cpc,vol:[search_volume, historical_volume],serp:{ results:serpResults,queries:pplAlsoAsk,snippet:snippet,avgWc:avgW,score:serpScore,post:aiserp.data.choices[0].text } })));       
                })
            }))
        })
    });
})

app.listen(8080, () => console.log('Running on port 8080'));