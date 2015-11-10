var express = require('express'),
    http = require('http'),
    twitter = require('twitter'),
    cors = require('cors');


var app = express();
app.use(cors());
var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(1798, function(){
    console.log("Server is now running on port 1798")
});

debugger;
app.on('error', function(error){
    console.log(error);
}); 

console.log(process.env);
//Twitter Section.  Credentials will be moved to environmental variables once this gets saved somewhere more public
var twitter = new twitter({

    consumer_key: process.env.twitter_consumer_key,
    consumer_secret: process.env.twitter_consumer_secret,
    access_token_key: process.env.twitter_token_key,
    access_token_secret: process.env.twitter_token_secret
});

//empty array to hold tweets during testing, this will go away once we get a more robust data model
var hate_tweets = [];
var starter_kit = [];
var counter = [];
var hate_terms = [
    {'term': 'fag', 'count' : 0},
    {'term': 'faggot', 'count' : 0},
    {'term': 'uncle tom','count' : 0},
    {'term': 'beaner','count' : 0},
    {'term': 'bluegum','count' : 0},
    {'term':  'bogtrotter','count' : 0},
    {'term':   'bohunk','count' : 0},
    {'term':   'buffie','count' : 0},
    {'term':    'sand nigger','count' : 0},
    {'term':   'ching chong','count' : 0},
    {'term':    'kill yourself','count' : 0},
    {'term':    'chinaman','count' : 0},
    {'term':    'chink','count' : 0},
    {'term':    'coolie','count' : 0},
    {'term':   'curry-muncher','count' : 0},
    {'term':    'dune coon','count' : 0},
    {'term':    'Gaijin','count' : 0},
    {'term':    'Gaikokujin','count' : 0},
    {'term':   'Gook','count' : 0},
    {'term':  'Greaseball','count' : 0},
    {'term':  'Guizi','count' : 0},
    {'term':   'Guido','count' : 0},
    {'term':   'Gweilo','count' : 0},
    {'term':    'Hajji','count' : 0},
    {'term':    'Half-breed', 'count' : 0},
    {'term':   'Haole','count' : 0},
    {'term':   'Hori','count' : 0},
    {'term':   'Hymie','count' : 0},
    {'term':    'Injun','count' : 0},
    {'term':    'Jap','count' : 0},
    {'term':    'Jungle bunny','count' : 0},
    {'term':    'Japie','count' : 0},
    {'term':   'Jigaboo','count' : 0},
    {'term':   'Katsap','count' : 0},
    {'term':    'Kike','count' : 0},
    {'term':    'jewed','count' : 0},
    {'term':    'Madrassi','count' : 0},
    {'term':    'Macaca','count' : 0},
    {'term': 'Mau-Mau','count' : 0},
    {'term':   'Moskal','count' : 0},
    {'term':   'Niglet','count' : 0},
    {'term':    'Nig-nog','count' : 0},
    {'term':   'Northern Monkey','count' : 0},
    {'term':    'Nusayri','count' : 0},
    {'term':    'Paki','count' : 0},
    {'term':    'Peckerwood','count' : 0},
    {'term':    'Pickaninny','count' : 0},
    {'term':    'Piefke','count' : 0},
    {'term':    'Polack','count' : 0},
    {'term':    'Prairie nigger','count' : 0},
    {'term':    'Quashie','count' : 0},
    {'term':     'Raghead','count' : 0},
    {'term':    'Rastus','count' : 0},
    {'term':    'Redlegs','count' : 0},
    {'term':     'Roundeye','count' : 0},
    {'term':     'Scandihoovian','count' : 0},
    {'term':    'Schvartse','count' : 0},
    {'term':    'Sheep shagger','count' : 0},
    {'term':    'Spic','count' : 0},
    {'term':    'Squaw','count' : 0},
    {'term':    'Taig','count' : 0},
    {'term':   'Tar-Baby','count' : 0},
    {'term':   'Timber nigger','count' : 0},
    {'term':   'Towel head','count' : 0},
    {'term':   'Wigger','count' : 0},
    {'term':   'Wog','count' : 0},
    {'term':    'Whitey','count' : 0},
    {'term':    "Wop",'count' : 0}
];
var hate_search = [];

for (term in hate_terms){
    hate_search.push(hate_terms[term].term);

}

twitter.stream('statuses/filter', {
    track: hate_search.toString()
}, function(stream){
    stream.on('data', function(tweet){

        //if tweet has coordinates, put it in the array
        //otherwise, take note if it and discard
        if(tweet.coordinates !== null)
        {
            console.log("Found georeferenced tweet!");
            console.log(tweet.coordinates.coordinates);
            countTerms(tweet);
            hate_tweets.push(tweet);
            io.emit('tweet:geo', tweet);
        }
        else
            {
                countTerms(tweet);
                console.log("sending non-geo tweet");
                io.emit('tweet:nongeo', tweet);
            }

    });
});




//get a starter kit!


for (var what in hate_terms)
{

    term = hate_terms[what];

    twitter.get('search/tweets', {q: term.term}, function (error, tweets, response) {
        if (error) {
            console.log(error);
        }

        else {
            for (tweet in tweets) {

                starter_kit.push(tweets[tweet]);
            }
        }
    });
}


var countTerms = function(tweet){
    var str = tweet.text;
    var m_counter = [];


    for (term in hate_terms)
    {
        item = hate_terms[term];

        if (str.indexOf(item.term) > -1) {
            console.log("updating counter for "+item.term)
            item.count += 1;
            io.emit('termupdate', hate_terms);
        }
    }
    console.log("done with loop");
    return counter;
}

//socket.io section

io.on('connection', function(socket){
    console.log("User has connected");
    socket.on('disconnect', function(){
        console.log('User has disconnected');
    });
});

//routes
app.get("/tweets", function(req, res){
    if(hate_tweets.length > 0){
        res.json(hate_tweets);
    }
    else{
        res.send("<h3>Sorry, no tweets available</h3>");
    }
});

app.get('/tweet/:id', function(req, res){
    var id = req.params.id;

});

app.get('/tweets/starter', function(req, res){

    res.json(starter_kit);
});
