const router = require('express').Router()
const jenkins = require('../utils/jenkins')
const { checkHeadersAndGetUniqueName, endRequest } = require('../utils/request')
const fs = require('fs')

async function getSkills(response, identity, module, project, build, jobName) {
    const projectDefinition = JSON.parse(fs.readFileSync(`/usr/src/app/jobs/${module}/${project}/definition.json`))
    const skills = projectDefinition.skills
    let results = null
    try {
        results = (await jenkins.get(`job/Jobs/job/${module}/job/${project}/job/${jobName}/${build}/artifact/marvin-data/results.json`)).data
    }
    catch (err) {
        // means that the build failed (marvin wasn't able to run)
    }
    response.data.project_description = projectDefinition.description
    response.data.skills = []
    for (const skill of skills) {
        const tests = []
        let total = 0
        let nbPassed = 0
        let nbFailed = 0
        let nbSkipped = 0
        for (const test of skill.tests) {
            if (results && results[skill.name] && !results[skill.name][test])
                continue
            tests.push({
                name: test.name,
                status: results && results[skill.name] && results[skill.name][test.name] ? results[skill.name][test.name].status : "SKIPPED",
                message: results && results[skill.name] && results[skill.name][test.name] ? results[skill.name][test.name].message : results ? 'Test not implemented.' : 'Build failed.'
            })
            if (results && results[skill.name] && results[skill.name][test.name] && results[skill.name][test.name].status == "PASSED")
                nbPassed++
            else if (results && results[skill.name] && results[skill.name][test.name] && results[skill.name][test.name].status == "FAILED")
                nbFailed++
            else
                nbSkipped++
            total++
        }
        response.data.skills.push({
            name: skill.name,
            total: total,
            passed: nbPassed,
            failed: nbFailed,
            skipped: nbSkipped,
            tests: tests
        })
    }
    if (results) {
        for (const skill in results) {
            if (!response.data.skills.find(s => s.name == skill)) {
                const tests = []
                let total = 0
                let nbPassed = 0
                let nbFailed = 0
                let nbSkipped = 0
                for (const test in results[skill]) {
                    tests.push({
                        name: test,
                        status: results[skill][test].status,
                        message: results[skill][test].message
                    })
                    if (results[skill][test].status == "PASSED")
                        nbPassed++
                    else if (results[skill][test].status == "FAILED")
                        nbFailed++
                    else
                        nbSkipped++
                    total++
                }
                response.data.skills.push({
                    name: skill,
                    total: total,
                    passed: nbPassed,
                    failed: nbFailed,
                    skipped: nbSkipped,
                    tests: tests
                })
            }
            for (const test in results[skill]) {
                if (!response.data.skills.find(s => s.name == skill).tests.find(t => t.name == test)) {
                    response.data.skills.find(s => s.name == skill).tests.push({
                        name: test,
                        status: results[skill][test].status,
                        message: results[skill][test].message
                    })
                    if (results[skill][test].status == "PASSED")
                        response.data.skills.find(s => s.name == skill).passed++
                    else if (results[skill][test].status == "FAILED")
                        response.data.skills.find(s => s.name == skill).failed++
                    else
                        response.data.skills.find(s => s.name == skill).skipped++
                    response.data.skills.find(s => s.name == skill).total++
                }
            }
        }
    }
}

async function getCoverage(response, identity, module, project, build, jobName) {
    try {
        const lines = (await jenkins.get(`job/Jobs/job/${module}/job/${project}/job/${jobName}/${build}/artifact/marvin-data/coverage_lines.txt`)).data
        const branches = (await jenkins.get(`job/Jobs/job/${module}/job/${project}/job/${jobName}/${build}/artifact/marvin-data/coverage_branches.txt`)).data
        response.data.coverage = {
            lines: lines,
            branches: branches
        }
    }
    catch (err) {
        // means that the build failed (marvin wasn't able to run) or the coverage was disabled on the project
        response.data.coverage = {
            lines: null,
            branches: null
        }
    }
}

async function getCodingStyle(response, identity, module, project, build, jobName) {
    response.data.coding_style_major = []
    response.data.coding_style_minor = []
    response.data.coding_style_info = []
    response.data.coding_style_other = []
    try {
        const codingStyle = (await jenkins.get(`job/Jobs/job/${module}/job/${project}/job/${jobName}/${build}/artifact/marvin-data/coding_style_reports.txt`)).data
        for (const line of codingStyle.split('\n')) {
            if (line.trim() == '')
                continue
            if (!line.trim().split(':')[2]) {
                response.data.coding_style_other.push(line)
                continue
            }
            switch (line.trim().split(':')[2].trim()) {
                case 'MAJOR':
                    response.data.coding_style_major.push(line)
                    break
                case 'MINOR':
                    response.data.coding_style_minor.push(line)
                    break
                case 'INFO':
                    response.data.coding_style_info.push(line)
                    break
                default:
                    response.data.coding_style_other.push(line)
            }
        }
    }
    catch (err) {
        // means that the coding style was disabled on the project (or failed, but this is unlikely)
    }
}

async function getBuildLogs(response, identity, module, project, build, jobName) {
    response.data.build_logs = "Build not launched. Please contact an administrator."
    try {
        const logs = (await jenkins.get(`job/Jobs/job/${module}/job/${project}/job/${jobName}/${build}/artifact/marvin-data/build_logs.txt`)).data
        response.data.build_logs = logs
    }
    catch (err) {
        // means that the build failed (marvin wasn't able to run)
    }
}

async function getBuildData(response, identity, module, project, build) {
    const jobName = identity.slice(0, identity.indexOf('@'))
    try {
        const builds = (await jenkins.get(`job/Jobs/job/${module}/job/${project}/job/${jobName}/api/json?tree=builds[number,timestamp,artifacts[fileName]]`)).data.builds
        for (const currentBuild of builds) { // Yes, we could simplify the code but it was creating a mystic bug
            if (currentBuild.number == build) {
                const summary = (await jenkins.get(`job/Jobs/job/${module}/job/${project}/job/${jobName}/${build}/artifact/marvin-data/summary.json`)).data
                response.data.build_start_time = currentBuild.timestamp
                response.data.summary = summary
                await getSkills(response, identity, module, project, build, jobName)
                await getCoverage(response, identity, module, project, build, jobName)
                await getCodingStyle(response, identity, module, project, build, jobName)
                await getBuildLogs(response, identity, module, project, build, jobName)
                return
            }
        }
    }
    catch (err) {
        if (err.response.status == 404) {
            response.status = "KO"
            response.message = "No module, project or build found"
        }
        else if (err.response.status == 500) {
            response.status = "KO"
            response.message = "Unable to communicate with Jenkins"
        }
        return
    }
    response.status = "KO"
    response.message = "No module, project or build found"
}

router.get('/view', async (req, res) => {
    const { module, project, build } = req.query
    const response = {
        status: "OK",
        message: "Success",
        data: {}
    }
    const identity = await checkHeadersAndGetUniqueName(req, response)
    if (response.status === "KO")
        return endRequest(res, response)
    if (!module || !project || !build) {
        response.status = "KO"
        response.message = "Invalid parameters"
        endRequest(res, response)
        return
    }
    await getBuildData(response, identity, module, project, build)
    endRequest(res, response)
})

module.exports = router
