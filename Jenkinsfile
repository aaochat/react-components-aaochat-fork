import groovy.json.JsonOutput

def URL = "https://chat.teamlocus.com/api/helper/webhook/jenkins"
def CONTENT_TYPE = "application/json"

pipeline{
    agent{
        label "built-in"
    }
    tools{
        nodejs 'NodeJS 18.17.1 TL-meet'
    }
    stages{
        stage("Start Notification") {
            steps {
                script {
                    def startData = [
                        "display_name": env.JOB_NAME,
                        "branch": env.GIT_BRANCH,
                        "build": [
                            "notes": "deepkiraninc/react-components-js-fork",
                            "phase": "STARTED"
                        ]
                    ]
                    def startJson = JsonOutput.toJson(startData)
                    sh "curl -X POST -H 'Content-Type: ${CONTENT_TYPE}' -d '${startJson}' '${URL}'"
                }
            }
        }
        stage("Develop"){
            when {
                branch 'deep-dev'
            }
            steps{
                echo "========executing deep-dev branch========"
                sh '''pnpm install --no-frozen-lockfile'''
                sh '''pnpm build'''
                sh '''cd /home/ubuntu/tlmeet-dev/livekit-react-core/
                    sudo git stash
                    sudo git pull origin develop
                    sudo rm -rf *
                    sudo cp -ra ${WORKSPACE}/packages/core/dist ${WORKSPACE}/packages/core/src ${WORKSPACE}/packages/core/package.json /home/ubuntu/tlmeet-dev/livekit-react-core/
                    sudo git add .
                    sudo git commit -m "Yarn built update from jenkins for core" || true
                    sudo git push origin develop'''
                sh '''cd /home/ubuntu/tlmeet-dev/livekit-react-components/
                    sudo git stash
                    sudo git pull origin develop
                    sudo rm -rf *
                    sudo cp -ra ${WORKSPACE}/packages/react/dist ${WORKSPACE}/packages/react/src ${WORKSPACE}/packages/react/etc ${WORKSPACE}/packages/react/api-extractor.json ${WORKSPACE}/packages/react/package.json /home/ubuntu/tlmeet-dev/livekit-react-components
                    sudo git add .
                    sudo git commit -m "Yarn built update from jenkins for components" || true
                    sudo git push origin develop'''
            }
        }
        stage('Trigger develop downstream job') {
            when {
                branch 'deep-dev'
            }
            steps {
                script {
                    def result = build job: 'W-tlmeet.teamlocus.com/develop'
                }
            }
        }
        stage("Master"){
            when {
                branch 'deep'
            }
            steps{
                echo "========executing business-aaochat branch========"
                sh '''pnpm install --no-frozen-lockfile'''
                sh '''pnpm build'''
                sh '''cd /home/ubuntu/tlmeet/livekit-react-core/
                    sudo git reset --hard origin/master
                    sudo git stash
                    sudo git pull origin master
                    sudo rm -rf *
                    sudo cp -ra ${WORKSPACE}/packages/core/dist ${WORKSPACE}/packages/core/src ${WORKSPACE}/packages/core/package.json /home/ubuntu/tlmeet/livekit-react-core/
                    sudo git add .
                    sudo git commit -m "Yarn built update from jenkins for core" || true
                    sudo git push origin master'''
                sh '''cd /home/ubuntu/tlmeet/livekit-react-components/
                    sudo git reset --hard origin/master
                    sudo git stash
                    sudo git pull origin master
                    sudo rm -rf *
                    sudo cp -ra ${WORKSPACE}/packages/react/dist ${WORKSPACE}/packages/react/src ${WORKSPACE}/packages/react/etc ${WORKSPACE}/packages/react/api-extractor.json ${WORKSPACE}/packages/react/package.json /home/ubuntu/tlmeet/livekit-react-components
                    sudo git add .
                    sudo git commit -m "Yarn built update from jenkins for components" || true
                    sudo git push origin master'''
            }
        }
        stage('Trigger master downstream job') {
            when {
                branch 'deep'
            }
            steps {
                script {
                    def result = build job: 'W-tlmeet.teamlocus.com/master'
                }
            }
        }  
          
    }
    post {
        always {
            script {
                script {
                    def jobName = env.JOB_NAME.split('/')[0]
                    def buildNumber = env.BUILD_NUMBER
                    def branch = env.GIT_BRANCH
                    def blueOceanUrl = "${env.JENKINS_URL}blue/organizations/jenkins/${jobName}/detail/${branch}/${buildNumber}/pipeline"
                    def snsEndpoint = "https://chat.teamlocus.com/api/helper/webhook/sns?channel_id=64770e70b4b2575897c99ae4&content=text"
                    sh """
                    curl -X POST -H 'Content-type: application/json' --data '{
                    "text": "Pipeline ${jobName} #${buildNumber} has been executed. Check Blue Ocean for details: ${blueOceanUrl}"
                    }' ${snsEndpoint} """
            }
            }
        }
    }
}