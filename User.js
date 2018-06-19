class User {
    constructor(id, name) {
        this.ID = id;
        this.name = name;
        this.articles = [];
        this.artNames = {}
    }
    inform(topic, data) {
        if (!this.artNames[topic.ID]) {
            this.artNames[topic.ID] = topic.name   
        }
        this.articles.push({
            "title": topic.name,
            "message": data,
            "news_id": topic.ID
        });
    }
}
module.exports = User;