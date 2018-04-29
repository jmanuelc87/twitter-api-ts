import { Twitter } from "./src/twitter";


let tweet = new Twitter(
    "",
    "",
    "",
    ""
)

let params = new Map<string, string>();
params.set('q', '#Nasa');
params.set('count', '5');

let promise = tweet.request('GET', '/1.1/search/tweets.json', params);


promise.then(data => {
    data.statuses.forEach(element => {
        console.log(element.text);
    });
});
