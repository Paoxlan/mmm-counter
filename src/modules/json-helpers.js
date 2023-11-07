const fs = require('fs');

module.exports = {
    readJSON(path) {
        try {
            const data = fs.readFileSync(path, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            console.error(err);
        }
    }
}