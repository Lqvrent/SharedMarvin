// TOOLs
folder("Tools") {
    displayName("Tools")
}

freeStyleJob("Tools/Refresh") {
    label("built-in")
    displayName("Refresh")
    description("Creates modules & projects folders")
    triggers {
        cron("H * * * *")
    }
    steps {
        systemGroovyScriptFile("/var/jenkins_home/init.groovy.d/refresh.groovy")
    }
    logRotator {
        numToKeep(48) // keep logs for 2 days
    }
    concurrentBuild(false)
}
