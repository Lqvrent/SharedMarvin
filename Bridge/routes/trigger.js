const { Client } = require('pg')
const router = require('express').Router()
const { checkHeadersAndGetUniqueName, endRequest } = require('../utils/request')
const jenkins = require('../utils/jenkins')
const { tryToConnect, tryToEnd } = require('../utils/db')
const fs = require('fs')
require.extensions['.xml'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};
const baseConfig = require('../utils/job_config.xml')

async function checkLocation(module, project, response) {
    try {
        await jenkins.get(`job/Jobs/job/${module}/job/${project}/api/json`)
    }
    catch (err) {
        response.status = "KO"
        response.message = "Invalid module or project"
    }
}

async function checkFile(module, project, file, response, identity) {
    if (!file) {
        response.status = "KO"
        response.message = "Missing file"
        return
    }
    if (!file.name.endsWith('.zip')) {
        response.status = "KO"
        response.message = "Invalid file"
        return
    }
    file.name = `${identity}.zip`
    try {
        await file.mv(`/usr/src/app/sources/${module}/${project}/${file.name}`)
    }
    catch (err) {
        console.error(err)
        response.status = "KO"
        response.message = "Error while uploading file"
    }
}

async function checkTriggerTime(identity, response) {
    const db = new Client()
    await tryToConnect(db, response)
    if (response.status === "KO")
        return
    try {
        const query = await db.query(`SELECT * FROM users WHERE "identity" = $1`, [identity])
        if (query.rows.length === 0) {
            response.status = "KO"
            response.message = "Invalid identity"
            return
        }
        await tryToEnd(db, response)
        if (process.env.ADMINISTRATORS.includes(identity))
            return
        const last_trigger = new Date(query.rows[0].last_trigger)
        const waiting_time = process.env.WAITING_TIME
        const now = new Date()
        const waiting_time_in_ms = waiting_time * 60 * 1000
        if (last_trigger.getTime() + waiting_time_in_ms > now.getTime()) {
            response.status = "KO"
            response.message = `You can't trigger a build yet. ${Math.ceil((last_trigger.getTime() + waiting_time_in_ms - now.getTime()) / 1000)} seconds left`
            return
        }
    }
    catch (err) {
        console.error(err)
        response.status = "KO"
        response.message = "Error while communicating with database"
        return
    }
}

async function updateIdentity(identity, response) {
    const db = new Client()
    await tryToConnect(db, response)
    if (response.status === "KO")
        return
    try {
        await db.query(`UPDATE users SET "last_trigger" = $1 WHERE "identity" = $2`, [new Date(), identity])
        await tryToEnd(db, response)
    }
    catch (err) {
        console.error(err)
        response.status = "KO"
        response.message = "Error while communicating with database"
    }
}

function jobConfigTemplate(module, project, identity, response) {
    try {
        const projConfig = JSON.parse(fs.readFileSync(`/usr/src/app/jobs/${module}/${project}/definition.json`, 'utf8'))
        const jobDsl = `pipeline {
        agent any
        stages {
            stage("Setup workspace") {
                steps {
                    cleanWs()
                    sh '''set +x
                        cp /var/sources/${module}/${project}/${identity}.zip .
                        unzip ${identity}.zip > /dev/null
                        rm ${identity}.zip /var/sources/${module}/${project}/${identity}.zip
                        if [ $(ls -1 | wc -l) -eq 1 ]; then
                            FOLLOWING_FOLDER=$(ls -1)
                            mv $FOLLOWING_FOLDER/* .
                            rm -rf $FOLLOWING_FOLDER
                        fi
                        echo "===> SYSTEM: Moved project source to workspace"
                        rm -rf project-data && mkdir project-data
                        cp -r /var/jenkins_home/jobs_templates/${module}/${project}/* project-data/
                        echo "===> SYSTEM: Moved ${module}/${project} tests & ressources to workspace"
                        rm -rf marvin-data && mkdir marvin-data
                        cp -r /var/marvin/* marvin-data/
                        echo "===> SYSTEM: Moved Marvin to workspace"
                        ${projConfig["enable-coding-style"] == false ? `echo "===> SYSTEM: SKIP: Coding style disabled on ${module}/${project}."` : ''}
                    set -x'''
                }
            }
            ${projConfig["enable-coding-style"] == true ? `stage("Coding style") {
                steps {
                    sh '''set +x
                        docker run --rm -i -v "$PWD":"/mnt/delivery" -v "$PWD/marvin-data":"/mnt/reports" ghcr.io/epitech/coding-style-checker:latest "/mnt/delivery" "/mnt/reports"
                        if [ ! -f marvin-data/coding-style-reports.log ]; then
                            echo "===> SYSTEM: ERROR: Coding style reports not found."
                            exit 1
                        fi
                        mv marvin-data/coding-style-reports.log marvin-data/coding_style_reports.txt
                        echo "$(wc -l < "marvin-data/coding_style_reports.txt") coding style error(s) reported: $(grep -c ": MAJOR:" "marvin-data/coding_style_reports.txt") major, $(grep -c ": MINOR:" "marvin-data/coding_style_reports.txt") minor, $(grep -c ": INFO:" "marvin-data/coding_style_reports.txt") info"
                    set -x'''
                }
            }` : `` }
            stage("Coverage") {
                agent {
                    docker {
                        image 'epitechcontent/epitest-docker:latest'
                        reuseNode true
                        args '-i --entrypoint='
                    }
                }
                steps {
                    sh '''set +x
                    ${projConfig["enable-coverage"] == true ? `
                            echo "==================== WORKSPACE BEFORE COVERAGE ===================="
                            ls -la
                            echo "==================== WORKSPACE BEFORE COVERAGE ===================="
                            echo "===> SYSTEM: make tests_run"
                            make tests_run || true
                            echo "===> SYSTEM: Running gcovr"
                            gcovr --exclude=tests/ > marvin-data/coverage_lines.txt
                            gcovr --exclude=tests/ --branches > marvin-data/coverage_branches.txt
                            gcovr --exclude=tests/ --cobertura marvin-data/coverage_report.xml
                            echo "===> SYSTEM: Coverage report generated."
                            echo "===> SYSTEM: Lines coverage:"
                            cat marvin-data/coverage_lines.txt
                            echo "===> SYSTEM: Branches coverage:"
                            cat marvin-data/coverage_branches.txt
                            sed -i '2d' marvin-data/coverage_report.xml
                        ` : `echo "===> SYSTEM: SKIP: Coverage disabled on ${module}/${project}."`}
                    set -x'''
                    ${projConfig["enable-coverage"] == true ? `
                        publishCoverage adapters: [cobertura('marvin-data/coverage_report.xml')]
                    `: ''}
                }
            }
            stage("Setup testing environment") {
                agent {
                    docker {
                        image 'epitechcontent/epitest-docker:latest'
                        reuseNode true
                        args '-i --entrypoint='
                    }
                }
                steps {
                    sh '''set +x
                        echo "==================== WORKSPACE BEFORE SETUP ===================="
                        ls -la
                        echo "==================== WORKSPACE BEFORE SETUP ===================="
                        echo "===> SETUP: Starting setup."
                        python3 marvin-data/marvin.py --setup
                    set -x'''
                }
            }
            stage("Build") {
                agent {
                    docker {
                        image 'epitechcontent/epitest-docker:latest'
                        reuseNode true
                        args '-i --entrypoint='
                    }
                }
                steps {
                    sh '''set +x
                        echo "==================== WORKSPACE BEFORE BUILDING ===================="
                        ls -la
                        echo "==================== WORKSPACE BEFORE BUILDING ===================="
                        echo "===> BUILD: Starting build."
                        python3 marvin-data/marvin.py --building
                    set -x'''
                }
            }
            stage("Testing") {
                agent {
                    docker {
                        image 'epitechcontent/epitest-docker:latest'
                        reuseNode true
                        args '-i --entrypoint='
                    }
                }
                steps {
                    sh '''set +x
                        echo "==================== WORKSPACE BEFORE TESTING ===================="
                        ls -la
                        echo "==================== WORKSPACE BEFORE TESTING ===================="
                        echo "===> TESTING: Starting tests."
                        python3 marvin-data/marvin.py --testing
                    set -x'''
                }
            }
        }
        post {
            always {
                sh '''set +x
                    python3 marvin-data/summary.py
                    rm marvin-data/*.py
                set -x'''
                junit 'marvin-data/tests_report.xml'
                archiveArtifacts artifacts: 'marvin-data/**/*', fingerprint: true, onlyIfSuccessful: false, allowEmptyArchive: true
                cleanWs()
            }
        }
    }`.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/#/g, '&')
        return baseConfig.toString().replace("{{DISPLAY_NAME}}", `${identity}`).replace("{{SCRIPT}}", jobDsl)
    }
    catch (err) {
        response.status = "KO"
        response.message = "Error while reading project config -- please contact an administrator"
    }
}

async function createOrUpdateJob(module, project, identity, response) {
    const jobName = identity.slice(0, identity.indexOf('@'))
    const jobConfig = jobConfigTemplate(module, project, identity, response)
    if (response.status === "KO")
        return
    try {
        // check if job exists
        await jenkins.get(`job/Jobs/job/${module}/job/${project}/job/${jobName}/api/json`)
    }
    catch (err) {
        // job doesn't exist, create it
        try {
            await jenkins.post(`job/Jobs/job/${module}/job/${project}/createItem?name=${jobName}`, jobConfig, { headers: { 'Content-Type': 'application/xml' } })
        }
        catch (err) {
            console.error(err)
            response.status = "KO"
            response.message = "Error while communicating with jenkins"
            return
        }
    }
    // job exists, update it and build it
    try {
        await jenkins.post(`job/Jobs/job/${module}/job/${project}/job/${jobName}/config.xml`, jobConfig, { headers: { 'Content-Type': 'application/xml' } })
        await jenkins.post(`job/Jobs/job/${module}/job/${project}/job/${jobName}/build`)
    }
    catch (err) {
        console.error(err)
        response.status = "KO"
        response.message = "Error while communicating with jenkins"
    }
}

router.post('/trigger', async (req, res) => {
    const response = {
        status: "OK",
        message: "Success",
        data: {}
    }
    const identity = await checkHeadersAndGetUniqueName(req, response)
    if (response.status === "KO")
        return endRequest(res, response)
    const { module, project } = req.body
    await checkLocation(module, project, response)
    if (response.status === "KO")
        return endRequest(res, response)
    if (process.env.WAITING_TIME > 0)
        await checkTriggerTime(identity, response)
    if (response.status === "KO")
        return endRequest(res, response)
    const file = req.files && req.files.file ? req.files.file : null
    await checkFile(module, project, file, response, identity)
    if (response.status === "KO")
        return endRequest(res, response)
    await updateIdentity(identity, response)
    if (response.status === "KO")
        return endRequest(res, response)
    await createOrUpdateJob(module, project, identity, response)
    if (response.status === "KO")
        return endRequest(res, response)
    endRequest(res, response)
})

module.exports = router
