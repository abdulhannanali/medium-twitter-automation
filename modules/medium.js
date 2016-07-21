const mediumSdk = require("medium-sdk")
const pug = require("pug")
const moment = require("moment")

const mediumClient = new mediumSdk.MediumClient({
	clientId: process.env.MEDIUM_CLIENT_ID,
	clientSecret: process.env.MEDIUM_CLIENT_SECRET
})


var publicationId = process.env.MEDIUM_PUBLICATION_ID
var userId = process.env.MEDIUM_USER_ID

mediumClient.setAccessToken(process.env.MEDIUM_INTEGRATION_TOKEN)

mediumClient.getUser(function (error, user) {
	if (!error && user) {
		userId = user.id
		console.log("User id reset to " + userId)
	} 
})

function publishTweet(tweetBody, publication, callback) {
	if (!tweetBody) {
		throw new Error("tweetBody is required")
	}

	var storyContent = pug.renderFile("./templates/post.pug", {
		tweet: tweetBody,
		username: process.env.TWITTER_USERNAME
	})
	
	var storyObj = {
		userId: userId,
		contentFormat: "markdown",
		tags: ["tweet", "twitter", "computistic"],
		publishStatus: "public",
		license: 'public-domain' // tweets are a part of public domain let them be
	}

	storyObj.title = tweetBody.text.slice(0, 90)
	storyObj.content = storyContent


	if (publication) {
		storyObj.publicationId = publicationId
		mediumClient.createPostInPublication(storyObj, callback)
	} else {
		mediumClient.createPost(storyObj, callback)		
	}
}

module.exports = {
	client: mediumClient,
	publishTweet: publishTweet
}