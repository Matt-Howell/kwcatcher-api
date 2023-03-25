const express = require('express');
const app = express();
const psl = require('psl');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
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

    const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "y", "z"]
    
    let allKeys = []
    for(i=0;i<alphabet.length;i++){
        allKeys.push(String(alphabet[i]+" ").concat(String(req.query.seed)))
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
        const response = await fetch(`https://api.valueserp.com/search?api_key=57A1364A491A4F10B27A5FF9BA00A54C&q=${req.query.seed.replace(" ", "+")}&gl=${req.query.cc}&include_answer_box=false&flatten_results=false&page=1&num=10&output=json&include_html=false`, {
            method: 'GET',
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
            let relatedSearches = []  
            let serpResults = []
            let totalWords = 0
            let snippet = data.answer_box ? { title:data.answer_box.answers[0].source.title, url:data.answer_box.answers[0].source.link, answer:data.answer_box.answers[0].answer } : null;
            (async function(next) {
                data.organic_results.forEach( async (elem) => {
                    async function getWordCount(url) {
                        try {
                            const browser = await puppeteer.launch({
                                args: ['--no-sandbox']
                            });

                            const page = await browser.newPage();
                            await page.goto(url);

                            const words = await page.$eval('body', body => {
                                const data = [];
                                count = 0
                                data.push(...body.getElementsByTagName('h1'));
                                data.push(...body.getElementsByTagName('h2'));
                                data.push(...body.getElementsByTagName('h3'));
                                data.push(...body.getElementsByTagName('h4'));
                                data.push(...body.getElementsByTagName('h5'));
                                data.push(...body.getElementsByTagName('p'));
                                data.push(...body.getElementsByTagName('a'));
                                data.push(...body.getElementsByTagName('span'));
                                data.push(...body.getElementsByTagName('div'));
                                data.push(...body.getElementsByTagName('li'));
                                data.push(...body.getElementsByTagName('td'));
                                data.push(...body.getElementsByTagName('pre'));
                                data.push(...body.getElementsByTagName('code'));
                                data.forEach(elm => {
                                    count += elm.innerText.split(' ').length;
                                });
                                return count;
                            });

                            return words
                        }
                        catch(e) {
                            console.log(e)
                            return 404
                        }
                    }
                    await getWordCount(elem.link).then((result) => {
                        serpResults.push({ rank:elem.position, title:elem.title, url:elem.link, wc:result, secure:elem.about_this_result.connection_secure.raw=="Your connection to this site is <b>secure</b>"?true:false })
                        totalWords += result
                        if (serpResults.length == data.organic_results.length) {
                            next()
                        }
                    })
                })
            }(async function() {
                data.related_questions.forEach((elem) => {
                    pplAlsoAsk.push(elem.question)
                })
                data.related_searches.forEach((elem) => {
                    relatedSearches.push(elem.query)
                })
                let avgW = Math.floor(totalWords/serpResults.length)
                async function getserpscore() {
                    let serpScore = 5
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
                    "adobe.com",
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
                            serpScore -= 1
                        }    
                        const response = await fetch(`https://ipty.de/domage/api.php?domain=${psl.parse(serpResults[i].url).domain}`, {
                            method: 'GET'
                        })
                        avgDays += parseInt(response.text())
                    }
                    if (avgDays/(serpResults.length) < 1500) {
                        serpScore -= 2
                    }
                    if (snippet != null) {
                        serpScore -= 1
                    }
                    if (avgW < 1000){
                        serpScore -= 2
                    } else if (avgW < 1500) {
                        serpScore -= 1
                    }
                    if (serpScore < 1) {
                        serpScore = 1
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
                      }).then(aiserp => res.send(JSON.stringify({ cpc:cpc,vol:[search_volume, historical_volume],serp:{ results:serpResults,queries:pplAlsoAsk,snippet:snippet,avgWc:avgW,score:serpScore,rel:relatedSearches,post:aiserp.data.choices[0].text } })))
                })
            }))
        })
    });
})

app.listen(8080, () => console.log('Running on port 8080'));