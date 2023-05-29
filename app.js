import express from 'express';
const app = express();
import psl from 'psl';
import needle from 'needle';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import { Configuration, OpenAIApi } from "openai";
import dotenv from 'dotenv'
dotenv.config()

app.get('/get-kws', async (req, res) => { 
    res.set('Access-Control-Allow-Origin', 'https://keywordcatcher.com')
    // res.set('Access-Control-Allow-Origin', 'http://localhost:3000')
    if (req.query.seed=="Yv7m2bqnGJsfn4MI5JJf") {
        res.sendStatus(200)
        return;
    }
    if (req.query.seed.length == 0) {
        return [];
    }
    async function postData(val) {
        const response = await fetch('https://api.serpsbot.com/v2/google/search-suggestions', {
            method: 'POST',
            headers: {
                'X-API-KEY': 'C7RmWpEFYbzsLrpdxfedWo2Jt5fbe3LE',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "hl": "en_US",
                "keywords": val   
            })
        })
        return response.json()
    }

    let allVals = []

    const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "y", "z"]
    
    let allKeys = []
    var i;
    for(i=0;i<alphabet.length;i++){
        allKeys.push(String(req.query.seed).concat(" "+alphabet[i]))
        if(req.query.seed.includes("*")){
            allKeys.push(req.query.seed.replace("*", alphabet[i]+"*"))
        } else {
            allKeys.push(alphabet[i]+" ".concat(String(req.query.seed)))
        }
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
                console.log(data)
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
    res.set('Access-Control-Allow-Origin', 'https://keywordcatcher.com')
    // res.set('Access-Control-Allow-Origin', 'http://localhost:3000')
    if (req.query.seed=="Yv7m2bqnGJsfn4MI5JJf") {
        res.sendStatus(200)
        return;
    }
    if (req.query.seed.length == 0) {
        return [];
    }
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
        const response = await fetch(`https://api.valueserp.com/search?api_key=57A1364A491A4F10B27A5FF9BA00A54C&q=${req.query.seed.replace(" ", "+")}&include_answer_box=false&gl=US&flatten_results=false&page=1&num=10&output=json&include_html=false`, {
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
            console.log(data)
            let pplAlsoAsk = []  
            let relatedSearches = []  
            let serpResults = []
            let totalWords = 0
            let snippet = data.answer_box && data.answer_box.answers[0].source ? { title:data.answer_box.answers[0].source.title, url:data.answer_box.answers[0].source.link, answer:data.answer_box.answers[0].answer } : null;
            (async function(next) {
                async function getWordCount(url) {
                    try {
                        let timeA = new Date().getTime()
                        let timeDiff = 0
                        const response = await needle('get', url)
                        .then(function(resp) {
                            timeDiff = Math.floor(new Date().getTime() - timeA) / 1000
                            return resp.body
                        })
                        .catch(function(err) {
                            console.log(err)
                        });

                        try {
                            if(typeof response === 'string'){
                                const $ = cheerio.load(response);
                        
                                const words = $('body *').contents().map(function() {
                                    return (this.tagName === 'h1' || 'h2' || 'h3' || 'h4' || 'h5' || 'h6' || 'p' || 'td' || 'li' || 'code' || 'a') ? $(this).text() : '';
                                }).get().length;
    
                                return [words, timeDiff]
                            } else {
                                return [404, 0]
                            }
                        } catch (error) {
                            console.log(error)
                            return [404, 0]
                        }
                    }
                    catch(e) {
                        console.log(e)
                        return [404, 0]
                    }
                    }
                let promises = []
                let elems = []
                data.organic_results.forEach( async (elem) => {
                    promises.push(getWordCount(elem.link))
                    elems.push(elem)
                })
                Promise.all(promises).then((results) => {
                    results.forEach((result, ind) => {
                        console.log(result)
                        serpResults.push({ rank:elems[ind].position, title:elems[ind].title, url:elems[ind].link, wc:result[0], timeFetch:result[1] })
                        totalWords += result[0]
                        if (serpResults.length == data.organic_results.length) {
                            next()
                        }
                    })
                })
            }(async function() {
                data.related_questions ? data.related_questions.forEach((elem) => {
                    pplAlsoAsk.push(elem.question)
                }) : null
                data.related_searches ? data.related_searches.forEach((elem) => {
                    relatedSearches.push(elem.query)
                }) : null
                let avgW = Math.floor(totalWords/serpResults.length)
                async function getserpscore() {
                    let serpScore = 5
                    let lowForum = ["reddit.com","quora.com","stackexchange.com","stackoverflow.com","tomshardware.com","askinglot.com","wix.com","blogspot.com","wordpress.com","pinterest.com","facebook.com","twitter.com","linkedin.com","yahoo.com",
                    "wordpress.org",
                    "github.com",
                    "pinterest.com",
                    "twitter.com"]
                    for (let i = 0; i < serpResults.length; i++) {
                        if(lowForum.includes(psl.parse(serpResults[i].url).domain)){
                            serpScore -= 1
                        }  
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
                    if (serpScore > 3) {
                        serpScore -= 2
                    }
                    return serpScore
                }
                await getserpscore().then( async (serpScore) => {
                   res.send(JSON.stringify({ cpc:cpc,vol:[search_volume, historical_volume],serp:{ results:serpResults,queries:pplAlsoAsk,snippet:snippet,avgWc:avgW,score:serpScore,rel:relatedSearches, post:null } }))
                })
            }))
        })
    });
})

app.get('/get-outline', async (req, res) => { 
    res.set('Access-Control-Allow-Origin', 'https://keywordcatcher.com')
    // res.set('Access-Control-Allow-Origin', 'http://localhost:3000')

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    
    await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: `Create a blog post outline for the keyword: "${req.query.kw}".  Give the post title and a short outline with subheadings & titles as just a bullet point list using "-" and "◦".`}],
      temperature: 0.01,
      max_tokens: 412,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: ["---"]
    }).then(aiserp => res.send(JSON.stringify({ post:aiserp.data.choices[0].message.content } )))
})

app.listen(8080, () => console.log('Running on port 8080'));
