const axios = require('axios')
function httpGet(w) {
    return axios.get('https://www.iciba.com/word?w='+w)
}

module.exports = {
    httpGet,
}