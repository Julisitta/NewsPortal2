const http = require('http');
const fs = require('fs');
const url = require('url');

class EventEmitter {
    constructor() {
        this._storage = {};
    }
    addSubscriber(topicName, user) {
        if(!this._storage[topicName]) {
            this._storage[topicName] = [];
        }
        this._storage[topicName].push(user);
        user.storage[topicName] = [];

    }
    removeSubscriber(topicName, user) {
        if (this._storage[topicName]) {
            this._storage[topicName] = this._storage[topicName].filter(storUser => user !== storUser);
        }
        delete user.storage[topicName]
        if ((this._storage[topicName]).length == 0) {
            delete this._storage[topicName]; 
        }
    }
    emit(topicName, data) {
        if(this._storage[topicName]) {
            this._storage[topicName].forEach(user => user.inform(topicName, data));
        }
    }
}

class User {
    constructor(id, name) {
        this.ID = id;
        this.name = name;
        this.inform = this.inform.bind(this);
        this.storage = {};
    }
    inform(topicName, data) {
        console.log(this.ID + " user " + this.name + " get " + data);
        if(!this.storage[topicName]) {
            this.storage[topicName] = [];
        }    
        this.storage[topicName].push(data);
    }
}

class Jurnaluga {
    constructor(name, topics) {
        this.name = name;
        this.topics = topics;
    }
    sendNews(topic) {
        let rnd = Math.random().toString(36).substring(2, 15);
        return this.name + " topic: " + topic + " about " + rnd;
    }
    interval(myEventEmit, topic) {
        let timerId = setInterval(() => 
            myEventEmit.emit(topic, this.sendNews(topic)),
            1000);
        setTimeout(() => 
                clearInterval(timerId),
            3000);
    }	
}

class Topics {
    constructor (id, name) {
    this.ID = id;
    this.name = name;
    }    
}

let myEventEmitter = new EventEmitter();

let user1 = new User(1, "Margo");
let user2 = new User(2, "Renat");
let user3 = new User(3, "Kate");

let users = [user1, user2, user3];

let topic1 = new Topics(1, "ShowBiz");
let topic2 = new Topics(2, "Cars");
let topic3 = new Topics(3, "Fashion");

let topics = [topic1, topic2, topic3];

let jur = new Jurnaluga("CrocusSity", topics);

myEventEmitter.addSubscriber(topic1.name, user1);
myEventEmitter.addSubscriber(topic2.name, user1);
myEventEmitter.addSubscriber(topic2.name, user2);
myEventEmitter.addSubscriber(topic1.name, user3);
myEventEmitter.addSubscriber(topic3.name, user3);

myEventEmitter.emit(topic1.name, jur.sendNews(topic1.name));
myEventEmitter.emit(topic2.name, jur.sendNews(topic2.name));
myEventEmitter.emit(topic3.name, jur.sendNews(topic3.name));

myEventEmitter.removeSubscriber(topic3.name, user3);

myEventEmitter.emit(topic1.name, jur.sendNews(topic1.name));
myEventEmitter.emit(topic2.name, jur.sendNews(topic2.name));
myEventEmitter.emit(topic3.name, jur.sendNews(topic3.name));

//jur.interval(myEventEmitter, topics1.name);

const server = http.createServer((request, response) => {
    let pathname = url.parse(request.url).pathname
    
    if (request.method == 'GET') {
        if (pathname.match(new RegExp('/user/[0-9]$'))) {
            let query = pathname.match(new RegExp('/user/[0-9]'))
            id = parseInt(query.input.split("/")[2]);
            let user = users.filter(storUser => id === storUser.ID)[0]
            if (user !== 'undefined') {
                response.writeHead(200, {"Content-Type": "text/plain"});
                let json = JSON.stringify(user);
                response.end(json);
            } else {
                response.writeHead(404, {"Content-Type": "text/plain"});
                response.write("User not found");
                response.end();
            }
        } else if (pathname.match(new RegExp('/user/[0-9]/subscription'))) {
            let query = pathname.match(new RegExp('/user/[0-9]/subscription'))
            id = parseInt(query.input.split("/")[2]);
            let user = users.filter(storUser => id === storUser.ID)[0]
            if (user !== 'undefined') {
                response.writeHead(200, {"Content-Type": "text/plain"});
                let json = JSON.stringify({subscriptions:Object.keys(user.storage)})
                response.end(json);
            } else {
                response.writeHead(404, {"Content-Type": "text/plain"});
                response.write("User not found");
                response.end();
            }
        } else  if (pathname.match(new RegExp('/user/[0-9]/export'))) {
            let query = pathname.match(new RegExp('/user/[0-9]/export'))
            id = parseInt(query.input.split("/")[2]);
            let user = users.filter(storUser => id === storUser.ID)[0]
            if (user !== 'undefined') {
                response.writeHead(200, {"Content-Type": "text/plain"});
                let json = JSON.stringify({subsData:user.storage})
                fs.writeFile('test.txt', json, (err) => {
                    if (err) throw err;
                    console.log('The file has been saved!');
                });
                response.end(json)
            } else {
                response.writeHead(404, {"Content-Type": "text/plain"});
                response.write("User not found");
                response.end();
            }
        } else  if (pathname.match(new RegExp('/news/[0-9]$'))) {
            let query = pathname.match(new RegExp('/news/[0-9]'))
            id = parseInt(query.input.split("/")[2]);
            let news = topics.filter(storTopic => id === storTopic.ID)[0]
            if (news !== 'undefined') {
                response.writeHead(200, {"Content-Type": "text/plain"});
                let json = JSON.stringify(news)
                response.end(json);
            } else {
                response.writeHead(404, {"Content-Type": "text/plain"});
                response.write("News not found");
                response.end();
            }
        } else  if (pathname.match(new RegExp('/news/[0-9]/subscribe/[0-9]'))) {
            let query = pathname.match(new RegExp('/news/[0-9]/subscribe/[0-9]'))
            newsID = parseInt(query.input.split("/")[2]);
            userID = parseInt(query.input.split("/")[4])
            let user = users.filter(storUser => userID === storUser.ID)[0]
            let news = topics.filter(storTopic => newsID === storTopic.ID)[0]
            if (user !== 'undefined' && news !== 'undefined') {
                myEventEmitter.addSubscriber(news, user)
                response.writeHead(201, {"Content-Type": "text/plain"});
                response.end("User subscribed");
            } else {
                response.writeHead(404, {"Content-Type": "text/plain"});
                response.write("News or User not found");
                response.end();
            }
        } else  if (pathname.match(new RegExp('/news/[0-9]/unsubscribe/[0-9]'))) {
            let query = pathname.match(new RegExp('/news/[0-9]/unsubscribe/[0-9]'))
            newsID = parseInt(query.input.split("/")[2]);
            userID = parseInt(query.input.split("/")[4])
            let user = users.filter(storUser => userID === storUser.ID)[0]
            let news = topics.filter(storTopic => newsID === storTopic.ID)[0]
            if (user !== 'undefined' && news !== 'undefined') {
                myEventEmitter.addSubscriber(news, user)
                response.writeHead(201, {"Content-Type": "text/plain"});
                response.end("User unsubscribed");
            } else {
                response.writeHead(404, {"Content-Type": "text/plain"});
                response.write("News or User not found");
                response.end();
            }
        }
    }
});
server.listen(3000, () => console.log('Server working'));
