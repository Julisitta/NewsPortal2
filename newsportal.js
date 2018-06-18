const http = require('http');
const fs = require('fs');
const url = require('url');
let EventEmitter = require("./EventEmitter");
let User = require("./User");
let Jurnaluga = require("./Jurnaluga");
let Topic = require("./Topic");

let myEventEmitter = new EventEmitter();

let user1 = new User(1, "Margo");
let user2 = new User(2, "Renat");
let user3 = new User(3, "Kate");

let users = [user1, user2, user3];

let topic1 = new Topic(1, "ShowBiz");
let topic2 = new Topic(2, "Cars");
let topic3 = new Topic(3, "Fashion");

let topics = [topic1, topic2, topic3];

let jur = new Jurnaluga("CrocusSity", topics);

const server = http.createServer((request, response) => {
    let pathname = url.parse(request.url).pathname;
    let responseFunc = (info) => {
        response.writeHead(200, {"Content-Type": "application/json"});
        if (typeof info !== 'string') {
            let json = JSON.stringify(info);
            response.end(json);      
        }
        else {
            response.end(info);   
        }  
    }
    let respErrFunc = (err) => {
        response.writeHead(404, {"Content-Type": "application/json"});
        response.write(err + " not found!");
    }
    let getUserAndNews = (query, withNews) => {
        if (withNews == true) {
            let newsID = parseInt(query.input.split("/")[2]);
            let userID = parseInt(query.input.split("/")[4]);
            let news = topics.filter(storTopic => newsID === storTopic.ID);
            let user = users.filter(storUser => userID === storUser.ID);
            return [news, user];
        } else {
            let userID = parseInt(query.input.split("/")[2]);
            let user = users.filter(storUser => userID === storUser.ID);
            return user;
        }   
    }
    if (request.method == 'GET') {
        if (pathname.match('/user/[0-9]+$')) {
            let user = getUserAndNews(pathname.match('/user/[0-9]+'), false);
            if (user.length == 1) {
                responseFunc(user[0]);
            } else {
                respErrFunc("User");
            }
        } else if (pathname.match('/user/[0-9]+/subscription$')) {
            let user = getUserAndNews(pathname.match('/user/[0-9]+/subscription$'), false);
            if (user.length == 1) {
                responseFunc({subscriptions:Object.keys(user[0].articles)});
            } else {
                respErrFunc("User");
            }
        } else  if (pathname.match('/user/[0-9]+/export$')) {
            let user = getUserAndNews(pathname.match('/user/[0-9]+/export$'), false);
            if (user.length == 1) {
                let json = JSON.stringify({Articles:user[0].articles});
                let time = new Date(Date.now());
                let filePath = "user_" + user[0].ID + "_" + time.getHours() + "_" + time.getMinutes() + ".json"
                fs.writeFile(filePath, json, (err) => {
                    if (err) throw err;
                    console.log('The file has been saved!', filePath);
                });
                response.writeHead(200, {
                    'Content-Type': 'Content-Type:text/plain; charset=ISO-8859-15',
                });
                fs.createReadStream(filePath).pipe(response);
            } else {
                respErrFunc("User");
            }
        } else  if (pathname.match('/news/[0-9]+$')) {
            let news = getUserAndNews(pathname.match('/news/[0-9]+$'), true)[0];
            if (news.length == 1) {
                let json = JSON.stringify(news[0]);
                responseFunc(json);
            } else {
                respErrFunc("News");
            }
        } else  if (pathname.match('/news/[0-9]+/subscribe/[0-9]+$')) {
            let newsUser = getUserAndNews(pathname.match('/news/[0-9]+/subscribe/[0-9]+$'), true);
            let news = newsUser[0];
            let user = newsUser[1];
            if (user.length == 1 && news.length == 1) {
                myEventEmitter.addSubscriber(news[0].name, user[0]);
                jur.interval(myEventEmitter, news[0]);
                responseFunc("User subscribed");
            } else {
                respErrFunc("News or User");
            }
        } else  if (pathname.match('/news/[0-9]+/unsubscribe/[0-9]+$')) {
            let newsUser = getUserAndNews(pathname.match('/news/[0-9]+/unsubscribe/[0-9]+$'), true)
            let news = newsUser[0];
            let user = newsUser[1];
            if (user.length == 1 && news.length == 1) {
                myEventEmitter.removeSubscriber(news[0].name, user[0]);
                responseFunc("User unsubscribed");
            } else {
                respErrFunc("News or User");
            }
        }
    } else {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("Default 404"); 
        response.end();
    }
});
server.listen(3000, () => console.log('Server working'));
