const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'), { multiArgs: true });
// const ig = bluebird.promisifyAll(require('instagram-node').instagram());
const Twit = require('twit');

const turl = "https://app.ticketmaster.com/discovery/v2"

// Get Ticket master events based on category
exports.getEventList = (req,res,next) => {
    const tkey = process.env.TICKETMASTER_APIKEY
    let event = req.params.name
    request.getAsync({ 'url': `${turl}/events?apikey=${tkey}&classificationName=${event}&countryCode=US&stateCode=CA`, json: true })
    //.then( ([request, result]) => res.json({events: result._embedded.events}))
    .then( ([request, result]) => res.render("api/event", {events: result._embedded.events}))
    .catch(next)
}

// Get Ticket master Event details  based on Event ID
exports.getEventInfo = (req,res,next) => {
    const tkey = process.env.TICKETMASTER_APIKEY
    const id = req.params.id
    request.getAsync({ 'url': `${turl}/events/${id}?apikey=${tkey}`, json: true })
    //.then( ([request, result]) => res.json({events: result._embedded.events}))
    .then( ([request, result]) => res.render("api/eventdetails", {event: result}))
    .catch(next)
}

// Get relevant Tweets based on Event Name
exports.getTwitter = (req, res, next) => {
    const keyword = req.params.keyword
    const T = new Twit({
      consumer_key: process.env.TWITTER_KEY,
      consumer_secret: process.env.TWITTER_SECRET,
      access_token: req.user.twitter.token,
      access_token_secret: req.user.twitter.tokenSecret
    });

    T.get('search/tweets', { q: keyword, count: 10 }, (err, reply) => {
        if (err) { return next(err) }
        res.render('api/twitter', {
          title: 'Twitter API',
          keyword,
          tweets: reply.statuses
        });
      });

  };

// Post Tweet to Twitter
exports.postTwitter = (req, res, next) => {
    req.assert('tweet', 'Tweet cannot be empty').notEmpty();
    const errors = req.validationErrors();
    const messages ={success:[], errors:[]}
    if (errors) {
      messages.errors=errors
      return res.json(messages);
    }
    const T = new Twit({
      consumer_key: process.env.TWITTER_KEY,
      consumer_secret: process.env.TWITTER_SECRET,
      access_token: req.user.twitter.token,
      access_token_secret: req.user.twitter.tokenSecret
    });
    T.post('statuses/update', { status: req.body.tweet }, (err) => {
      if (err) {
        messages.errors.push({msg: err.message})
        return res.json(messages);
       }
      messages.success.push({ msg: 'Your tweet has been posted.' })
      res.json(messages);
    });
  };

// Get Instagram Media based on Event Name
  exports.getInstagram = (req, res, next) => {
    let keyword = req.query.keyword
    ig.use({ client_id: process.env.INSTAGRAM_ID, client_secret: process.env.INSTAGRAM_SECRET });
    ig.use({ access_token: req.user.instagram.accessToken});
    ig.tag_media_recentAsync(keyword)
        .then( (medias, pagination, remaining, limit) => {
         res.send(medias)})
        .catch(next)
    // ig.locationAsync("losangeles_city")
    //     .then( (result, remaining, limit) => res.send(result))
    //     .catch(next)
  }
