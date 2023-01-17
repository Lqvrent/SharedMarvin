module.exports = {
    tryToConnect: async function (db, response) {
        try {
            await db.connect()
        } catch (e) {
            response.status = "KO"
            response.message = "Error while communicating with the database"
        }
    },

    tryToEnd: async function (db, response) {
        try {
            await db.end()
        } catch (e) {
            response.status = "KO"
            response.message = "Error while communicating with the database"
        }
    }
}
