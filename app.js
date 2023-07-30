import express from 'express';
const app = express();
import psl from 'psl';
import needle from 'needle';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import { Configuration, OpenAIApi } from "openai";
import dotenv from 'dotenv'
dotenv.config()
import { google } from 'googleapis'

// const client = new GoogleAdsApi({
//     client_id: "639034362315-olj8pt00chv64ba489a75qut9uagblsd.apps.googleusercontent.com",
//     client_secret: "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",
//     developer_token: "pywkS_9ozjYFIaK5pqic9w",
// });
// 
// const customerVal = client.Customer({
//     customer_id:"4983521940",
//     refresh_token:"1//04vuLsgbeCpzzCgYIARAAGAQSNwF-L9IrPVrXbrZnr3WN_GklTNhjkadKaTmBRN5584CIOlBbz17JrAwgqAk8YWR_i4AlhQO79UU",
// });

app.get('/get-kws', async (req, res) => { 
    res.set('Access-Control-Allow-Origin', 'https://app.keywordcatcher.com')
    // res.set('Access-Control-Allow-Origin', 'http://localhost:3000')
    if (req.query.seed=="Yv7m2bqnGJsfn4MI5JJf") {
        res.sendStatus(200)
        return;
    }
    if (req.query.seed.length == 0) {
        return [];
    }
    async function postData(val) {
        console.log(`${req.query.lang}_${req.query.geo}`)
        const response = await fetch('https://api.serpsbot.com/v2/google/search-suggestions', {
            method: 'POST',
            headers: {
                'X-API-KEY': 'C7RmWpEFYbzsLrpdxfedWo2Jt5fbe3LE',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "hl": `${req.query.lang}_${req.query.geo}`,
                "keywords": val,
                'gl': req.query.geo  
            })
        }).catch(e => console.log(e))
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

    const geos = [
        [
            "AU",
            "2036"
        ],
        [
            "BR",
            "2076"
        ],
        [
            "CA",
            "2124"
        ],
        [
            "CN",
            "2156"
        ],
        [
            "EG",
            "2818"
        ],
        [
            "FR",
            "2250"
        ],
        [
            "DE",
            "2276"
        ],
        [
            "IN",
            "2356"
        ],
        [
            "IE",
            "2372"
        ],
        [
            "IL",
            "2376"
        ],
        [
            "JP",
            "2392"
        ],
        [
            "KR",
            "2410"
        ],
        [
            "PK",
            "2586"
        ],
        [
            "PT",
            "2620"
        ],
        [
            "RO",
            "2642"
        ],
        [
            "RU",
            "2643"
        ],
        [
            "SA",
            "2682"
        ],
        [
            "SG",
            "2702"
        ],
        [
            "ZA",
            "2710"
        ],
        [
            "ES",
            "2724"
        ],
        [
            "SE",
            "2752"
        ],
        [
            "CH",
            "2756"
        ],
        [
            "TR",
            "2792"
        ],
        [
            "UA",
            "2804"
        ],
        [
            "AE",
            "2784"
        ],
        [
            "GB",
            "2826"
        ],
        [
            "VE",
            "2862"
        ],
        [
            "US",
            "2840"
        ]
    ]

    let langConstants = ["ar,1019", "bn,1056", "bg,1020", "ca,1038", "zh,1017", "zh,1018", "hr,1039", "cs,1021", "da,1009", "nl,1010", "en,1000", "et,1043", "tl,1042", "fi,1011", "fr,1002", "de,1001", "el,1022", "gu,1072", "he,1027", "hi,1023", "hu,1024", "is,1026", "id,1025", "it,1004", "ja,1005", "kn,1086", "ko,1012", "lv,1028", "lt,1029", "ms,1102", "ml,1098", "mr,1101", "no,1013", "fa,1064", "pl,1030", "pt,1014", "pa,1110", "ro,1032", "ru,1031", "sr,1035", "sk,1033", "sl,1034", "es,1003", "sv,1015", "ta,1130", "te,1131", "th,1044", "tr,1037", "uk,1036", "ur,1041", "vi,1040"]

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
                let targetGeo = geos.filter(val => val[0] == req.query.geo)
                let targetLang = langConstants.filter(el => el.split(",")[0] == req.query.lang.toLowerCase())
        
                const oauth2Client = new google.auth.OAuth2(
                    "670654031425-uu5hloc33m63oe2jspnq2nnribdsc1ot.apps.googleusercontent.com",
                    "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",
                    "https://app.keywordcatcher.com/"
                  );
                  
                  oauth2Client.setCredentials({
                    refresh_token: "1//04tlIiP3Lcv5bCgYIARAAGAQSNwF-L9Ir2rkVbtvn9trVtBEdVlVkV63S7-Ul2l5nN54T_NFW9BWESu027SjW_YRHDHneqMBAvyk" 
                  });

                  oauth2Client.getAccessToken((err, token) => {
                    if (err) {
                      console.log(err);
                      return;
                    }
                    fetch('https://googleads.googleapis.com/v14/customers/9053142011:generateKeywordHistoricalMetrics', {
                        method: 'POST',
                        headers: {
                            'developer-token': 'tyOzrJ3BDYUbndWp8bZBkQ',
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            'keywords': [...new Set(allVals)],
                            'language': `languageConstants/${targetLang[0].split(",")[1]}`,
                            'geoTargetConstants': [`geoTargetConstants/${targetGeo[0][1]}`],
                            "keywordPlanNetwork": "GOOGLE_SEARCH",
                            "historicalMetricsOptions":{"includeAverageCpc":true}
                        })
                    }).then((res) => res.json()).then((finals) => {
                        let sendValues = []
                        let dataFromGA = finals.results

                        dataFromGA.forEach((value, index, array) => { 
                            let temHistory = value !== undefined ? value !== null ? value.keywordMetrics !== null ? value.keywordMetrics.monthlySearchVolumes.slice(0, 12).map(val => ({month: val.month.substring(0, 1)+val.month.substring(1, val.month.length).toLowerCase()+" "+val.year, searches: parseInt(val.monthlySearches)})) || [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}]
                            let monthlyS = value !== undefined ? value !== null ? value.keywordMetrics !== null ? value.keywordMetrics.avgMonthlySearches : 0 : 0 : 0
                            let cpc = value !== undefined ? value !== null ? value.keywordMetrics !== null ? parseInt(value.keywordMetrics.averageCpcMicros) > 0 ? parseFloat(parseInt(value.keywordMetrics.averageCpcMicros)/1000000).toFixed(2) : 0 : 0 : 0 : 0
                            sendValues.push({keyword: value.text, volume: monthlyS, trend: temHistory, cpc:cpc })
                        })

                        res.send(JSON.stringify({ keywords: [...new Set(sendValues)] })) 
                    });
                  })
            }).catch((e) => console.log(e))
        } else {
            postData(newKeys.slice(0, 49)).then( async (data) => {
                data.data.forEach((elme2) => { 
                    elme2.suggestions.forEach((elme) => { 
                        allVals.push(elme)
                    })
                })
                let targetGeo = geos.filter(val => val[0] == req.query.geo)
                let targetLang = langConstants.filter(el => el.split(",")[0] == req.query.lang.toLowerCase())

                const oauth2Client = new google.auth.OAuth2(
                    "670654031425-uu5hloc33m63oe2jspnq2nnribdsc1ot.apps.googleusercontent.com",
                    "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",
                    "https://app.keywordcatcher.com/"
                  );
                  
                  oauth2Client.setCredentials({
                    refresh_token: "1//04tlIiP3Lcv5bCgYIARAAGAQSNwF-L9Ir2rkVbtvn9trVtBEdVlVkV63S7-Ul2l5nN54T_NFW9BWESu027SjW_YRHDHneqMBAvyk" 
                  });

                  oauth2Client.getAccessToken((err, token) => {
                    if (err) {
                      console.log(err);
                      return;
                    }
                    fetch('https://googleads.googleapis.com/v14/customers/9053142011:generateKeywordHistoricalMetrics', {
                        method: 'POST',
                        headers: {
                            'developer-token': 'tyOzrJ3BDYUbndWp8bZBkQ',
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            'keywords': [...new Set(allVals)],
                            'language': `languageConstants/${targetLang[0].split(",")[1]}`,
                            'geoTargetConstants': [`geoTargetConstants/${targetGeo[0][1]}`],
                            "keywordPlanNetwork": "GOOGLE_SEARCH",
                            "historicalMetricsOptions":{"includeAverageCpc":true}
                        })
                    }).then((res) => res.json()).then((finals) => {
                        let sendValues = []
                        let dataFromGA = finals.results

                        dataFromGA.forEach((value, index, array) => { 
                            let temHistory = value !== undefined ? value !== null ? value.keywordMetrics !== null ? value.keywordMetrics !== undefined ? value.keywordMetrics.monthlySearchVolumes.slice(0, 12).map(val => ({month: val.month.substring(0, 1)+val.month.substring(1, val.month.length).toLowerCase()+" "+val.year, searches: parseInt(val.monthlySearches)})) || [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}]
                            let monthlyS = value !== undefined ? value !== null ? value.keywordMetrics !== undefined ? value.keywordMetrics.avgMonthlySearches : 0 : 0 : 0
                            let cpc = value !== undefined ? value !== null ? value.keywordMetrics !== undefined ? parseInt(value.keywordMetrics.averageCpcMicros) > 0 ? parseFloat(parseInt(value.keywordMetrics.averageCpcMicros)/1000000).toFixed(2) : 0 : 0 : 0 : 0
                            sendValues.push({keyword: value.text, volume: monthlyS, trend: temHistory, cpc:cpc })
                        })

                        res.send(JSON.stringify({ keywords: [...new Set(sendValues)] })) 
                    });
                  })
            }).catch((e) => console.log(e))
        }
    }).catch(e => console.log(e));
})

app.get('/analyse-kw', async (req, res) => { 
    res.set('Access-Control-Allow-Origin', 'https://app.keywordcatcher.com')
    // res.set('Access-Control-Allow-Origin', 'http://localhost:3000')
    if (req.query.seed=="Yv7m2bqnGJsfn4MI5JJf") {
        res.sendStatus(200)
        return;
    }
    if (req.query.seed.length == 0) {
        return [];
    }

    async function getSERP(val) {
        const response = await fetch(`https://api.valueserp.com/search?api_key=57A1364A491A4F10B27A5FF9BA00A54C&q=${req.query.seed.replace(" ", "+")}&include_answer_box=false&gl=${req.query.geo.toLowerCase()}&flatten_results=false&page=1&num=10&output=json&include_html=false&hl=${req.query.lang}`, {
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

                        let totalOccs = 0

                        $('body *').contents().map(function() {
                            this.tagName === 'h1' || 'h2' || 'h3' || 'h4' || 'h5' || 'h6' || 'p' || 'td' || 'li' || 'code' || 'a' ? $(this).text().includes(req.query.seed) ? totalOccs += 1 : totalOccs += 0 : totalOccs += 0;
                        }).get()

                        const desc = $('meta[name="description"]').attr('content') || ""

                        const schema = $("script[type='application/ld+json']");
                        let allSchemas = []
                        schema.map((i, el) => {
                            allSchemas.push(JSON.parse(el.children[0].data))
                        })

                        return [words, timeDiff, desc, totalOccs, allSchemas]
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
                fetch(`http://domdetailer.com/api/checkDomain.php?domain=${psl.parse(elems[ind].domain).domain}&apikey=7XV4PI1LV3EJS&majesticChoice=root&app=keywordcatcher`, {method:"GET"} ).then( async (stats) => {
                    let backlinkStats = await stats.json()
                    let links = backlinkStats.mozLinks
                    let da = backlinkStats.mozDA
                    console.log(da, links)
                    console.log({ rank:elems[ind].position, title:elems[ind].title, url:elems[ind].link, da: da, links:links, wc:result[0], timeFetch:result[1], desc:result[2], occs:result[3] })
                    serpResults.push({ rank:elems[ind].position, title:elems[ind].title, url:elems[ind].link, da: da, links:links, wc:result[0], timeFetch:result[1], desc:result[2], occs:result[3], schema:result[4] })
                    totalWords += result[0]
                    if (serpResults.length == data.organic_results.length) {
                        next()
                    }
                })
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
             let avgDa = 0
             for (let i = 0; i < serpResults.length; i++) {
                 if(lowForum.includes(psl.parse(serpResults[i].url).domain)){
                     serpScore -= 1
                 }     
                 const response = await fetch(`https://ipty.de/domage/api.php?domain=${psl.parse(serpResults[i].url).domain}`, {
                     method: 'GET'
                 })
                 avgDa += parseInt(serpResults[i].da)
                 avgDays += parseInt(response.text())
             }
             if (avgDa/(serpResults.length) < 5) {
                 serpScore -= 3
             }
             if (avgDa/(serpResults.length) < 10) {
                 serpScore -= 2
             }
             if (avgDa/(serpResults.length) < 20) {
                 serpScore -= 1
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
             if (serpScore < 1){
                 serpScore = 1
             } else if (serpScore > 5) {
                 serpScore = 5
             }
             return serpScore
         }
         await getserpscore().then( async (serpScore) => {
            serpResults = serpResults.sort((a, b) => a.rank - b.rank)
            res.send(JSON.stringify({ serp:{ results:serpResults,queries:pplAlsoAsk,snippet:snippet,avgWc:avgW,score:serpScore,rel:relatedSearches, post:null } }))
         })
     }))
    })
})

app.get('/find-paa', async (req, res) => { 
   res.set('Access-Control-Allow-Origin', 'https://app.keywordcatcher.com')
   // res.set('Access-Control-Allow-Origin', 'http://localhost:3000')

    const geos = [
        [
            "AU",
            "2036"
        ],
        [
            "BR",
            "2076"
        ],
        [
            "CA",
            "2124"
        ],
        [
            "CN",
            "2156"
        ],
        [
            "EG",
            "2818"
        ],
        [
            "FR",
            "2250"
        ],
        [
            "DE",
            "2276"
        ],
        [
            "IN",
            "2356"
        ],
        [
            "IE",
            "2372"
        ],
        [
            "IL",
            "2376"
        ],
        [
            "JP",
            "2392"
        ],
        [
            "KR",
            "2410"
        ],
        [
            "PK",
            "2586"
        ],
        [
            "PT",
            "2620"
        ],
        [
            "RO",
            "2642"
        ],
        [
            "RU",
            "2643"
        ],
        [
            "SA",
            "2682"
        ],
        [
            "SG",
            "2702"
        ],
        [
            "ZA",
            "2710"
        ],
        [
            "ES",
            "2724"
        ],
        [
            "SE",
            "2752"
        ],
        [
            "CH",
            "2756"
        ],
        [
            "TR",
            "2792"
        ],
        [
            "UA",
            "2804"
        ],
        [
            "AE",
            "2784"
        ],
        [
            "GB",
            "2826"
        ],
        [
            "VE",
            "2862"
        ],
        [
            "US",
            "2840"
        ]
    ]

    let langConstants = ["ar,1019", "bn,1056", "bg,1020", "ca,1038", "zh,1017", "zh,1018", "hr,1039", "cs,1021", "da,1009", "nl,1010", "en,1000", "et,1043", "tl,1042", "fi,1011", "fr,1002", "de,1001", "el,1022", "gu,1072", "he,1027", "hi,1023", "hu,1024", "is,1026", "id,1025", "it,1004", "ja,1005", "kn,1086", "ko,1012", "lv,1028", "lt,1029", "ms,1102", "ml,1098", "mr,1101", "no,1013", "fa,1064", "pl,1030", "pt,1014", "pa,1110", "ro,1032", "ru,1031", "sr,1035", "sk,1033", "sl,1034", "es,1003", "sv,1015", "ta,1130", "te,1131", "th,1044", "tr,1037", "uk,1036", "ur,1041", "vi,1040"]

    let targetGeo = geos.filter(val => val[0] == req.query.geo)
    let targetLang = langConstants.filter(el => el.split(",")[0] == req.query.lang.toLowerCase())

    const oauth2Client = new google.auth.OAuth2(
      "670654031425-uu5hloc33m63oe2jspnq2nnribdsc1ot.apps.googleusercontent.com",
      "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",
      "https://app.keywordcatcher.com/"
    );
    
    oauth2Client.setCredentials({
      refresh_token: "1//04tlIiP3Lcv5bCgYIARAAGAQSNwF-L9Ir2rkVbtvn9trVtBEdVlVkV63S7-Ul2l5nN54T_NFW9BWESu027SjW_YRHDHneqMBAvyk" 
    });

    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        console.log(err);
        return;
      }
      fetch('https://googleads.googleapis.com/v14/customers/9053142011:generateKeywordHistoricalMetrics', {
          method: 'POST',
          headers: {
              'developer-token': 'tyOzrJ3BDYUbndWp8bZBkQ',
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              'keywords': [req.query.keyword],
              'language': `languageConstants/${targetLang[0].split(",")[1]}`,
              'geoTargetConstants': [`geoTargetConstants/${targetGeo[0][1]}`],
              "keywordPlanNetwork": "GOOGLE_SEARCH",
              "historicalMetricsOptions":{"includeAverageCpc":true}
          })
      }).then((res) => res.json()).then((finals) => {
          let sendValues = []
          let dataFromGA = finals.results

          dataFromGA.forEach((value, index, array) => { 
              let temHistory = value !== undefined ? value !== null ? value.keywordMetrics !== null ? value.keywordMetrics !== undefined ? value.keywordMetrics.monthlySearchVolumes.slice(0, 12).map(val => ({month: val.month.substring(0, 1)+val.month.substring(1, val.month.length).toLowerCase()+" "+val.year, searches: parseInt(val.monthlySearches)})) || [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}] : [{month: "June 2023", searches: 0}, {month: "May 2023", searches: 0}, {month: "April 2023", searches: 0}]
              let monthlyS = value !== undefined ? value !== null ? value.keywordMetrics !== undefined ? value.keywordMetrics.avgMonthlySearches : 0 : 0 : 0
              let cpc = value !== undefined ? value !== null ? value.keywordMetrics !== undefined ? parseInt(value.keywordMetrics.averageCpcMicros) > 0 ? parseFloat(parseInt(value.keywordMetrics.averageCpcMicros)/1000000).toFixed(2) : 0 : 0 : 0 : 0
              sendValues.push({keyword: value.text, volume: monthlyS, trend: temHistory, cpc:cpc })
          })

          res.send(JSON.stringify({ keywords: [...new Set(sendValues)] })) 
      }).catch((e) => console.log(e));
    })
})

app.get('/get-outline', async (req, res) => { 
    res.set('Access-Control-Allow-Origin', 'https://app.keywordcatcher.com')
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
