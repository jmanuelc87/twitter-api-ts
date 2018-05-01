import { Twitter, OAuth } from "./src/twitter";
import * as fs from "fs";


let tweet = new Twitter({
    accessToken: "",
    accessTokenSecret: "",
    consumerKey: "",
    consumerSecret: ""
})

let params = new Map<string, string>();
params.set('q', 'Fiesta');
params.set('count', '100');

let promise = tweet.request('GET', 'api.twitter.com', '/1.1/search/tweets.json', params);


promise.then(data => {
    fs.writeFileSync('twitterData.json', data);
});
