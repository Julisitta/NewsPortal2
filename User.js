class User {
    constructor(id, name) {
        this.ID = id;
        this.name = name;
        this.inform = this.inform.bind(this);
        this.articles = {};
    }
    inform(topic, data) {
        console.log(this.ID + " user " + this.name + " get " + data);
        if(!this.articles[topic.name]) {
            this.articles[topic.name] = [];
        }
        let tmpData = {
            "title": topic.name,
            "message": data,
            "news_id": topic.ID
        }
        this.articles[topic.name].push(tmpData);
    }
}
module.exports = User;