const http = require('http');
const url = require('url');
let EventEmitter = require("./EventEmitter");
let User = require("./User");
let Jurnaluga = require("./Jurnaluga");
let Topic = require("./Topic");
let ServFunc = require("./ServFunc");

let myEventEmitter = new EventEmitter();

let users = [new User(1, "Margo"), 
             new User(2, "Renat"), 
             new User(3, "Kate")
            ];

let topics = [new Topic(1, "ShowBiz"), 
              new Topic(2, "Cars"), 
              new Topic(3, "Fashion")
            ];

let jur = new Jurnaluga("CrocusSity");
let sf = new ServFunc();

const server = http.createServer((request, response) => {
    let pathname = url.parse(request.url).pathname;
    if (request.method == 'GET') {
        if (pathname.match('/user/[0-9]+$')) {
            let user = sf.getUserAndNews(pathname, false, users);
            if (user) {
                sf.responseJson(user, response);
            } else {
                sf.respErrFunc("User", response);
            }
        } else if (pathname.match('/user/[0-9]+/subscription$')) {
            let user = sf.getUserAndNews(pathname, false, users);
            if (user) {
                sf.responseJson({subscriptions:user.artNames}, response);
            } else {
                sf.respErrFunc("User", response);
            }
        } else  if (pathname.match('/user/[0-9]+/export$')) {
            let user = sf.getUserAndNews(pathname, false, users);
            if (user) {
                sf.sendFile(user, response);
            } else {
                sf.respErrFunc("User", response);
            }
        } else  if (pathname.match('/news/[0-9]+$')) {
            let news = sf.getUserAndNews(pathname, true, [], topics)[0];
            if (news) {
                sf.responseJson(news, response);
            } else {
                sf.respErrFunc("News", response);
            }
        } else  if (pathname.match('/news/[0-9]+/subscribe/[0-9]+$')) {
            let newsUser = sf.getUserAndNews(pathname, true, users, topics);
            let news = newsUser[0];
            let user = newsUser[1];
            if (user && news) {
                myEventEmitter.addSubscriber(news.name, user);
                jur.interval(myEventEmitter, news);
                sf.responseFunc(response);
            } else {
                sf.respErrFunc("News or User", response);
            }
        } else  if (pathname.match('/news/[0-9]+/unsubscribe/[0-9]+$')) {
            let newsUser = sf.getUserAndNews(pathname, true, users, topics);
            let news = newsUser[0];
            let user = newsUser[1];
            if (user && news) {
                myEventEmitter.removeSubscriber(news.name, user);
                sf.responseFunc(response);
            } else {
                sf.respErrFunc("News or User", response);
            }
        } else {
            sf.respErrFunc("Page", response);
        }
    } else {
        sf.respErrFunc("Method", response);
    }
});
server.listen(3000, () => console.log('Server working'));
