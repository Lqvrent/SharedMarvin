import jenkins.model.Jenkins
import hudson.model.*
import com.cloudbees.hudson.plugins.folder.*

def jenkins = Jenkins.instance

println("\nThis script should NEVER fail. If it does, please open an issue:")
println("https://github.com/Lqvrent/SharedMarvin/issues/new\n")

// If the jobs folder doesn't exists on Jenkins, create it
if (jenkins.getItem("Jobs") == null) {
    println "Creating Jobs folder"
    jenkins.createProject(Folder.class, "Jobs")
}

def jobsFolder = jenkins.getItem("Jobs")
def jobsTemplates = new File("/var/jenkins_home/jobs_templates")

// We will create a folder per module and a folder per project
jobsTemplates.eachDir { module ->
    def moduleFolder = jobsFolder.getItem(module.name)
    if (moduleFolder == null) {
        println "Creating module: ${module.name}"
        moduleFolder = jobsFolder.createProject(Folder.class, module.name)
    }
    module.eachDir { project ->
        def projectFolder = moduleFolder.getItem(project.name)
        def definition = new File(project, "definition.json").text
        def projectDescription = new groovy.json.JsonSlurper().parseText(definition).description
        if (projectFolder == null) {
            println "Creating project: ${module.name}/${project.name}"
            projectFolder = moduleFolder.createProject(Folder.class, project.name)
            projectFolder.description = projectDescription
            projectFolder.save()
        } else if (projectFolder.description != projectDescription) {
            println "Updating project: ${module.name}/${project.name}"
            projectFolder.description = projectDescription
            projectFolder.save()
        }
    }
}

// Cleaning modules folders in Jenkins (in case modules or projects were removed)
def modules = jobsFolder.getItems()
modules.each { module ->
    def moduleTemplate = new File("/var/jenkins_home/jobs_templates/${module.name}")
    if (!moduleTemplate.exists()) {
        println "Deleting module: ${module.name}"
        module.delete()
    } else {
        def projects = module.getItems()
        projects.each { project ->
            def projectTemplate = new File("/var/jenkins_home/jobs_templates/${module.name}/${project.name}")
            if (!projectTemplate.exists()) {
                println "Deleting project: ${module.name}/${project.name}"
                project.delete()
            }
        }
    }
}
return "SUCCESS"
