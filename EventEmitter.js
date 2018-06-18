class EventEmitter {
    constructor() {
        this._storage = {};
    }
    addSubscriber(topicName, user) {
        if(!this._storage[topicName]) {
            this._storage[topicName] = [];
        }
        this._storage[topicName].push(user);
        user.articles[topicName] = [];

    }
    removeSubscriber(topicName, user) {
        if (this._storage[topicName]) {
            this._storage[topicName] = this._storage[topicName].filter(storUser => user !== storUser);
        }
        delete user.articles[topicName]
        if ((this._storage[topicName]).length == 0) {
            delete this._storage[topicName]; 
        }
    }
    emit(topic, data) {
        if(this._storage[topic.name]) {
            this._storage[topic.name].forEach(user => user.inform(topic, data));
        }
    }
}

module.exports = EventEmitter;