const axios = require('axios')

const jenkins = axios.create({
    baseURL: `http://${process.env.JENKINS_USER}:${process.env.JENKINS_TOKEN}@${process.env.JENKINS_HOST}:8080/`,
    auth: {
        username: process.env.JENKINS_USER,
        password: process.env.JENKINS_TOKEN
    }
})

module.exports = jenkins
