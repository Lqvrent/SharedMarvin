const { Client } = require('pg')
const { tryToConnect, tryToEnd } = require('./db')

module.exports = {
    parseJWToken: parseJWToken = function (token) {
        const parsedToken = token.split(' ')[1]
        const parsedBody = JSON.parse(Buffer.from(parsedToken.split('.')[1], 'base64').toString('ascii'))
        return parsedBody
    },

    getIdentityFromKey: getIdentityFromKey = async function (key) {
        const db = new Client()
        try {
            await tryToConnect(db)
            const query = await db.query('SELECT * FROM users WHERE key = $1', [key])
            if (query.rowCount === 0)
                return null
            return query.rows[0].identity
        }
        catch (err) {
            return null
        }
        finally {
            await tryToEnd(db)
        }
    },

    endRequest: function (res, response) {
        res.status(response.status === "OK" ? 200 : 500).json(response)
    },

    checkHeadersAndGetUniqueName: async function (req, response) {
        if (req.headers['authorization']) {
            const identity = parseJWToken(req.headers['authorization'])
            if (!identity) {
                response.status = "KO"
                response.message = "Invalid token"
                return null
            }
            return identity.unique_name
        }
        if (req.headers['x-marvin-authorization']) {
            const identity = await getIdentityFromKey(req.headers['x-marvin-authorization'])
            if (!identity) {
                response.status = "KO"
                response.message = "Invalid api key"
                return null
            }
            return identity
        }
        response.status = "KO"
        response.message = "Missing authorization header"
        return null
    }
}
