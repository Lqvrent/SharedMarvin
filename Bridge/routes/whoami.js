const { Client } = require('pg')
const { tryToConnect, tryToEnd } = require('../utils/db')
const { checkHeadersAndGetUniqueName, endRequest } = require('../utils/request')
const router = require('express').Router()
const uuid = require('uuid').v4

async function createIdentity(db, identity, response) {
    const key = uuid()
    try {
        const query = await db.query('INSERT INTO users (identity, key) VALUES ($1, $2)', [identity, key])
        if (query.rowCount === 0) {
            response.status = "KO"
            response.message = "Error while communicating with the database"
            return
        }
        response.data.key = key
    }
    catch (err) {
        response.status = "KO"
        response.message = "Error while communicating with the database"
        return
    }
}

async function whoami(db, req, response, reset) {
    const identity = await checkHeadersAndGetUniqueName(req, response)
    if (!identity) {
        response.status = "KO"
        response.message = "Invalid token"
        return
    }
    response.data.identity = identity
    try {
        const query = await db.query('SELECT * FROM users WHERE identity = $1', [identity])
        if (query.rowCount === 0) {
            await createIdentity(db, identity, response)
            return
        }
        if (query.rows[0].last_trigger !== null && process.env.WAITING_TIME) {
            const lastTrigger = new Date(query.rows[0].last_trigger)
            if (!process.env.ADMINISTRATORS.includes(identity)) {
                const waitingTimeInMinutes = process.env.WAITING_TIME
                const nextTrigger = new Date(lastTrigger.getTime() + waitingTimeInMinutes * 60000)
                if (nextTrigger > new Date())
                    response.data.nextTrigger = nextTrigger.valueOf()
            }
            response.data.lastTrigger = lastTrigger.valueOf()
        }
        if (reset) {
            const key = uuid()
            const update = await db.query('UPDATE users SET key = $1 WHERE identity = $2', [key, identity])
            if (update.rowCount === 0) {
                response.status = "KO"
                response.message = "Error while communicating with the database"
                return
            }
            response.data.key = key
            return
        }
        response.data.key = query.rows[0].key
    }
    catch (err) {
        response.status = "KO"
        response.message = "Error while communicating with the database"
        return
    }
}

router.get('/whoami', async (req, res) => {
    const response = {
        status: "OK",
        message: "Success",
        data: {
            identity: null,
            key: null,
            lastTrigger: null,
            nextTrigger: null
        }
    }
    const reset = isNaN(req.query.reset) ? false : true
    const db = new Client()
    await tryToConnect(db, response)
    if (response.status === "KO")
        endRequest(res, response)
    await whoami(db, req, response, reset)
    await tryToEnd(db, response)
    endRequest(res, response)
})

module.exports = router
