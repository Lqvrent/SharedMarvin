const router = require('express').Router()
const jenkins = require('../utils/jenkins')
const { parseJWToken, endRequest } = require('../utils/request')

async function askJenkins(response) {
    try {
        const modules = (await jenkins.get('job/Jobs/api/json?tree=jobs[name]')).data.jobs
        response.data.modules = []
        for (let module of modules) {
            const projects = (await jenkins.get(`job/Jobs/job/${module.name}/api/json?tree=jobs[name,description]`)).data.jobs
            response.data.modules.push({
                name: module.name,
                projects: projects.map(project => {
                    return {
                        name: project.name,
                        description: project.description
                    }
                })
            })
        }
    }
    catch (err) {
        console.error(err)
        response.status = "KO"
        response.message = "Error while communicating with Jenkins"
        return
    }
}

router.get('/content', async (req, res) => {
    const response = {
        status: "OK",
        message: "Success",
        data: {}
    }
    const identity = (req.headers['authorization'] ? (await parseJWToken(req.headers['authorization'])) : null)
    if (identity === null) {
        response.status = "KO"
        response.message = "Invalid token"
        endRequest(res, response)
        return
    }
    await askJenkins(response)
    endRequest(res, response)
})

module.exports = router
