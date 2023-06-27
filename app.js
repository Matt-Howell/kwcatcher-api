import express from 'express';
const app = express();
import psl from 'psl';
import needle from 'needle';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import { Configuration, OpenAIApi } from "openai";
import dotenv from 'dotenv'
dotenv.config()
import { GoogleAdsApi } from "google-ads-api"; 

const client = new GoogleAdsApi({
    client_id: "670654031425-uu5hloc33m63oe2jspnq2nnribdsc1ot.apps.googleusercontent.com",
    client_secret: "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",
    developer_token: "tyOzrJ3BDYUbndWp8bZBkQ",
});

const customerVal = client.Customer({
    customer_id:"9053142011",
    refresh_token:"1//04dgoea_H_21ECgYIARAAGAQSNwF-L9IrcQRrqVMdnVMoNjhTCDb2pI2ax1ljzSB0MntSWpltMnwXta0JPpWAiAwCbdlmzPitIiQ",
});

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
                "keywords": val,
                'gl': req.query.geo  
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

    postData(allKeys).then( async (dataF) => {
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
                customerVal.keywordPlanIdeas.generateKeywordHistoricalMetrics({
                    keywords:[...new Set(allVals)],
                    customer_id:"9053142011"
                }).then(finals => {
                    let sendValues = []
                    let tempVals = [...new Set(allVals)]
                    let dataFromGA = finals.results

                    tempVals.forEach((value, index, array) => { 
                        let temHistory = dataFromGA[index] !== undefined ? dataFromGA[index] !== null ? dataFromGA[index].keyword_metrics !== null ? dataFromGA[index].keyword_metrics.monthly_search_volumes.slice(0, 12).map(val => ({month: val.month.substring(0, 1)+val.month.substring(1, val.month.length).toLowerCase()+" "+val.year, searches: parseInt(val.monthly_searches)})) || [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}]
                        let monthlyS = dataFromGA[index] !== undefined ? dataFromGA[index] !== null ? dataFromGA[index].keyword_metrics !== null ? dataFromGA[index].keyword_metrics.avg_monthly_searches : 0 : 0 : 0
                        sendValues.push({keyword: value, volume: monthlyS, trend: temHistory })
                    })

                    res.send(JSON.stringify({ keywords: [...new Set(sendValues)] })) 
                })
            })
        } else {
            postData(newKeys.slice(0, 49)).then((data) => {
                data.data.forEach((elme2) => { 
                    elme2.suggestions.forEach((elme) => { 
                        allVals.push(elme)
                    })
                })
                customerVal.keywordPlanIdeas.generateKeywordHistoricalMetrics({
                    keywords:[...new Set(allVals)],
                    customer_id:"9053142011"
                }).then(finals => {
                    let sendValues = []
                    let tempVals = [...new Set(allVals)]
                    let dataFromGA = finals.results

                    tempVals.forEach((value, index, array) => { 
                        let temHistory = dataFromGA[index] !== undefined ? dataFromGA[index] !== null ? dataFromGA[index].keyword_metrics !== null ? dataFromGA[index].keyword_metrics.monthly_search_volumes.slice(0, 12).map(val => ({month: val.month.substring(0, 1)+val.month.substring(1, val.month.length).toLowerCase()+" "+val.year, searches: parseInt(val.monthly_searches)})) || [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}]
                        let monthlyS = dataFromGA[index] !== undefined ? dataFromGA[index] !== null ? dataFromGA[index].keyword_metrics !== null ? dataFromGA[index].keyword_metrics.avg_monthly_searches : 0 : 0 : 0
                        sendValues.push({keyword: value, volume: monthlyS, trend: temHistory })
                    })

                    res.send(JSON.stringify({ keywords: [...new Set(sendValues)] })) 
                })
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

    async function getSERP(val) {
        const response = await fetch(`https://api.valueserp.com/search?api_key=57A1364A491A4F10B27A5FF9BA00A54C&q=${req.query.seed.replace(" ", "+")}&include_answer_box=false&gl=${req.query.geo.toLowerCase()}&flatten_results=false&page=1&num=10&output=json&include_html=false`, {
            method: 'GET',
        })
        return response.json()
    }


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
                     if (resp.body) {
                         return resp.body
                     } else {
                         return "<html><body><p>null</p></body></html>"
                     }
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
             console.log(results)
             results.forEach((result, ind) => {
                 console.log(result)
                 serpResults.push({ rank:elems[ind].position, title:elems[ind].title, url:elems[ind].link, wc:result[0], timeFetch:result[1] })
                 totalWords += result[0]
                 if (serpResults.length == data.organic_results.length) {
                     next()
                 }
             })
         })
         .catch((e) => console.log(e))
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
             if (avgDays/(serpResults.length) < 365) {
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
             if (serpScore > 3) {
                 serpScore -= 1
             }
             return serpScore
         }
         await getserpscore().then( async (serpScore) => {
            res.send(JSON.stringify({ serp:{ results:serpResults,queries:pplAlsoAsk,snippet:snippet,avgWc:avgW,score:serpScore,rel:relatedSearches, post:null } }))
         })
     }))
    })
})

app.get('/find-paa', async (req, res) => { 
    res.set('Access-Control-Allow-Origin', 'https://keywordcatcher.com')
    // res.set('Access-Control-Allow-Origin', 'http://localhost:3000')

    console.log(req.query.keyword)
    
    customerVal.keywordPlanIdeas.generateKeywordHistoricalMetrics({
        keywords:[req.query.keyword],
        customer_id:"9053142011"
    }).then(finals => {
        
        console.log(finals)
        let sendValues = []
        let tempVals = [req.query.keyword]
        let dataFromGA = finals.results

        tempVals.forEach((value, index, array) => { 
            let temHistory = dataFromGA[index] !== undefined ? dataFromGA[index] !== null ? dataFromGA[index].keyword_metrics !== null ? dataFromGA[index].keyword_metrics.monthly_search_volumes.slice(0, 12).map(val => ({month: val.month.substring(0, 1)+val.month.substring(1, val.month.length).toLowerCase()+" "+val.year, searches: parseInt(val.monthly_searches)})) || [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}]
            let monthlyS = dataFromGA[index] !== undefined ? dataFromGA[index] !== null ? dataFromGA[index].keyword_metrics !== null ? dataFromGA[index].keyword_metrics.avg_monthly_searches : 0 : 0 : 0
            sendValues.push({keyword: value, volume: monthlyS, trend: temHistory })
        })

        console.log(sendValues)

        res.send(JSON.stringify({ keywords: [...new Set(sendValues)] })) 
    }).catch(e => console.log(e));
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
