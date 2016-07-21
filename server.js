const express = require("express")
const bodyParser = require("body-parser")
const morgan = require("morgan")

const app = express()

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || "0.0.0.0"

const NODE_ENV = process.env.NODE_ENV || "development"

if (NODE_ENV == "development") {
	require("dotenv").config({
		path: "./keys.env"
	})

	app.use(morgan("dev", {}))
} else {
	app.use(morgan("combined", {}))
}

const medium = require("./modules/medium")
const SECRETKEY = process.env.SECRETKEY

var lastTweet = {}
var lastStory = {}

app.get("/getUser", function (req, res, next) {
	medium.client.getUser(function (error, userInfo) {
		if (!error && userInfo) {
			res.json(userInfo)
		}
		else {
			next()
		}
	})
})

app.get("/getPublications", function (req, res, next) {
	medium.client.getUser(function (error, userInfo) {
		if (!error && userInfo) {
			medium.client.getPublicationsForUser({
				userId: userInfo.id
			}, function (error, pubs) {
				if (error) {
					next()
				}
				else if (pubs) {
					res.json(pubs)
				}
			})
		}
		else {
			next()
		}
	})
})

app.post("/" + SECRETKEY, bodyParser.json(), function (req, res, next) {
	if (req.body && req.body.url && req.body.text) {
		res.send("okay")

		var tweetBody = req.body
		lastTweet = tweetBody

		// Don't post direct mentions
		if (tweetBody.text.indexOf("@") == 0) {
			// a quick return so we don't post
			return;
		}

		if (tweetBody.retweeted == "False") {
			medium.publishTweet(tweetBody, true, function (error, body) {
				if (error) {
					console.log(error)
				}
				else if (body) {
					console.log("Medium story published!")
					console.log(body)
					lastStory = body
				}
			})
		}
		else {
			console.log("Not posting about a retweeted tweet :) ")
		}
	}
	else {
		next()
	}
})

app.get("/lastTweet", function (req, res, next) {
	res.json(lastTweet)
})

app.get("/lastStory", function (req, res, next) {
	res.json(lastStory)
})

app.listen(PORT, HOST, function (error) {
	if (!error) {
		console.log(`Server is listening on ${HOST}:${PORT}`)
	}
})