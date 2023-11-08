const fs = require('fs');
const path = require('path');

module.exports = {
    Users: class Users {
        constructor(user) {
            Object.assign(this, user);
        }

        saveToJSON() {
            const users = Users.getUsersJSON();

            const user = users.find(user => user.user_id === this.user_id);
            user.rank = this.rank;
            user.count = this.count;
            user.mmms = this.mmms;
            user.upgrades = this.upgrades;

            fs.writeFileSync(Users.userJSONPath, JSON.stringify(users));
        }

        getUserId = () => this.user_id;
        getRank = () => this.rank;
        getCount = () => this.count;
        getMMM = () => Math.round(this.mmms);
        getUpgrades = () => this.upgrades;

        setRank(rank) {
            this.rank = rank;
            this.saveToJSON();

            return this;
        }

        setMMM(mmms) {
            this.mmms = mmms;
            this.saveToJSON();

            return this;
        }

        setCount(count) {
            this.count = count;
            this.saveToJSON();

            return this;
        }

        setUpgrades(upgrades) {
            this.upgrades = upgrades;
            this.saveToJSON();

            return this;
        }

        addUpgrade(upgrade) {
            const upgrades = this.getUpgrades();
            upgrades.push(upgrade);
            this.setUpgrades(upgrades);

            return this;
        }

        removeUpgrade(id) {
            const upgrades = this.getUpgrades();

            for (let upgrade of upgrades) {
                if (upgrade.id === id) {
                    upgrades.splice(upgrades.indexOf(upgrade), 1);
                    break;
                }
            }

            this.setUpgrades(upgrades);

            return this;
        }

        static userJSONPath = path.join(__dirname, '..', 'data', 'users.json');
        static getUsersJSON() {
            if (!fs.existsSync(Users.userJSONPath)) fs.writeFileSync(Users.userJSONPath, '[]');
            
            const data = fs.readFileSync(Users.userJSONPath, 'utf8');

            return JSON.parse(data);
        } 

        static createUser(id) {
            const users = this.getUsersJSON();

            if (users.find(user => user.user_id === id)) return this.getUser(id);

            const user = {
                user_id: id,
                rank: 1,
                count: 1,
                mmms: 1,
                upgrades: []
            };

            users.push(user);
            fs.writeFileSync(Users.userJSONPath, JSON.stringify(users));

            return new Users(user);
        }

        static getUser(id) {
            const users = this.getUsersJSON();
            const user = users.find(user => user.user_id === id);

            if (!user) return null;

            return new Users(user);
        }

        static getUsers() {
            const users = this.getUsersJSON();

            return users;
            //return users.map(user => new Users(user));
        }
    }
}