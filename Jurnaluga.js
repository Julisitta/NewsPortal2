class Jurnaluga {
    constructor(name) {
        this.name = name;
    }
    sendNews(topic) {
        let rnd = Math.random().toString(36).substring(2, 15);
        return this.name + " topic: " + topic.name + " about " + rnd;
    }
    interval(myEventEmit, topic) {
        let timerId = setInterval(() => 
            myEventEmit.emit(topic, this.sendNews(topic)),
            2000);
        setTimeout(() => 
                clearInterval(timerId),
            7000);
    }	
}

module.exports = Jurnaluga;