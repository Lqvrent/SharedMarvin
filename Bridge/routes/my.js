const router = require('express').Router()
const jenkins = require('../utils/jenkins')
const { checkHeadersAndGetUniqueName, endRequest } = require('../utils/request')

async function getProjectDescription(response, module, project) {
    try {
        const description = (await jenkins.get(`job/Jobs/job/${module}/job/${project}/api/json?tree=description`)).data.description
        response.data.project_description = description
    }
    catch (err) {
        console.error(err)
        response.status = "KO"
        response.message = "No module or project found"
        return
    }
}

async function getBuildsSummaries(response, identity, module, project)
{
    const jobName = identity.slice(0, identity.indexOf('@'))
    response.data.builds = []
    try {
        const builds = (await jenkins.get(`job/Jobs/job/${module}/job/${project}/job/${jobName}/api/json?tree=builds[number,timestamp,artifacts[fileName]]`)).data.builds
        for (const build of builds) {
            const buildNumber = build.number
            const buildStartTime = build.timestamp
            const buildSummary = build.artifacts.find(artifact => artifact.fileName == 'summary.json')
            if (buildSummary) {
                const summary = (await jenkins.get(`job/Jobs/job/${module}/job/${project}/job/${jobName}/${buildNumber}/artifact/marvin-data/summary.json`)).data
                response.data.builds.push({
                    build_number: buildNumber,
                    build_start_time: buildStartTime,
                    build_summary: summary
                })
            }
        }
    }
    catch (err) {
        // means that the user don't have builds in this project
        return
    }
}

router.get('/my', async (req, res) => {
    const { module, project } = req.query
    const response = {
        status: "OK",
        message: "Success",
        data: {}
    }
    const identity = await checkHeadersAndGetUniqueName(req, response)
    if (response.status === "KO")
        return endRequest(res, response)
    if (!module || !project) {
        response.status = "KO"
        response.message = "Invalid parameters"
        endRequest(res, response)
        return
    }
    await getProjectDescription(response, module, project)
    if (response.status === "KO") {
        endRequest(res, response)
        return
    }
    await getBuildsSummaries(response, identity, module, project)
    if (response.status === "KO") {
        endRequest(res, response)
        return
    }
    endRequest(res, response)
})

module.exports = router
