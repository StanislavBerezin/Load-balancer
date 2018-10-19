const Twitter = require("twitter");
const twitter = new Twitter({
    consumer_key: "C2tUjaWK9qOOU6BFWIMd52v45",
    consumer_secret: "FIAjgruq3Kx09Iwwh0NiQYPp7wLyzG4wFzfSHiRowLBjy8S4md",
    access_token_key: "843837609797287938-qcJFHUWUJY74tJ2Hdn6Jm4obRII7IlI",
    access_token_secret: "eSdfw7DUEa0zMTpBBYmHcVjSrkwr8TGcETRP4hYLO795m"
});
const util = require('util');
const Sentiment = require("sentiment");
const sentiment = new Sentiment();





const statModel = require('../models/stat')
const mongoose = require('mongoose')


twitter.get = util.promisify(twitter.get);


module.exports = {
    async saveResults(req, res) {
        try {

            let statInstance = await new statModel({
                title: req.body.title,
                negPercent: req.body.negPercent,
                posPercent: req.body.posPercent,
                negWords: req.body.negWords,
                posWords: req.body.posWords,
                positivePie: req.body.positivePie,
                negativePie: req.body.negativePie
            });

            let isDeleted = await statModel.findOneAndDelete({
                title: req.body.title
            })

            let isSaved = await statInstance.save()



            console.log('saved')
            // let isSaved = await statInstance.save()
            // if (isSaved) {
            //     res.send("has been saved")
            // }
            res.send('has been saved')





        } catch (e) {
            res.send('Error happened')
        }


    },

    async viewResults(req, res) {
        statModel.find().then((data) => {
            res.send(data)
        }).catch((e) => {
            res.send("An error occured, please try refreshing the page")
        })

    },

    async specSearch(req, res) {
        let positive = []
        let negative = []
        let negativePie
        let positivePie
        let sum
        let negPercent
        let posPercent
        let negWords = []
        let posWords = []
        let reducer = (accumulator, currentValue) => accumulator + currentValue;

        try {
            let term = await req.body.search;

            let twitterFeed = await twitter.get('search/tweets', {
                q: `${term} since:2018-07-11`,
                count: 200,
                language: 'en',
            })
            let sentAnalyse = await twitterFeed.statuses.map((each, index) => {
                var result = sentiment.analyze(each.text);

                if (result.score != 0) {

                    if (result.score > 0) {
                        positive = [result.score].concat(positive);
                        posWords = [result.positive].concat(posWords);
                    } else {
                        negative = [result.score].concat(negative);
                        negWords = [result.negative].concat(negWords);
                    }
                }
            })
            positivePie = positive.reduce(reducer)
            negativePie = Math.abs(negative.reduce(reducer))
            sum = positivePie + negativePie;
            posPercent = (positivePie * 100) / sum;
            negPercent = (negativePie * 100) / sum;

            let sentimentObject = {
                negWords,
                posWords,
                positivePie,
                negativePie,
                posPercent,
                negPercent
            }

            res.status(200).send(sentimentObject)



        } catch (e) {
            console.log(e)
            res.send("error occured")
        }

    },

    async stopFlow(req, res) {
        console.log("Stop")
        try {

            res.status(200).send("done");
        } catch (e) {
            res.status(400).send("error");
        }

    }
};