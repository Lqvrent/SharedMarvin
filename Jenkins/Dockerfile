FROM jenkins/jenkins:lts

# Configuration as code, jobs, and scripts
COPY --chown=jenkins:jenkins configuration.yml /var/jenkins_home/casc_configuration.yml
COPY --chown=jenkins:jenkins jobs.groovy /var/jenkins_home/jobs.groovy
COPY --chown=jenkins:jenkins refresh.groovy /var/jenkins_home/init.groovy.d/refresh.groovy

# Dependencies
USER root
RUN apt-get update
RUN apt-get install -y ca-certificates curl gnupg lsb-release groovy sudo grep

# Docker - Setting up the repository
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
RUN echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
    $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker - Installing and setting up Docker Engine
RUN apt-get update
RUN apt-get install -y docker-ce docker-ce-cli containerd.io

# Environment variables
ENV JAVA_OPTS "-Djenkins.install.runSetupWizard=false -Dpermissive-script-security.enabled=true"
ENV CASC_JENKINS_CONFIG /var/jenkins_home/casc_configuration.yml

# Plugins
COPY --chown=jenkins:jenkins plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli -f /usr/share/jenkins/ref/plugins.txt
