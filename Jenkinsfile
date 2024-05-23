import groovy.json.JsonOutput

def URL = "https://chat.teamlocus.com/api/helper/webhook/jenkins"
def CONTENT_TYPE = "application/json"

pipeline{
    agent{
        label "built-in"
    }
    tools{
        nodejs 'NodeJS 18.16.0'
    }
    stages{
        stage("Start Notification") {
            steps {
                script {
                    def startData = [
                        "display_name": env.JOB_NAME,
                        "build": [
                            "notes": "aaochat/react-components-aaochat-fork",
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
                branch 'business-aaochat-dev'
            }
            steps{
                echo "========executing business-aaochat-dev branch========"
                sh '''yarn install'''
                sh '''yarn build'''
                sh '''cd /home/ubuntu/Business-Aaochat-Meet-Beta/livekit-react-core/
                    sudo git reset --hard business-develop
                    sudo git stash
                    sudo git pull origin business-develop
                    sudo rm -rf *
                    sudo cp -ra ${WORKSPACE}/packages/core/dist ${WORKSPACE}/packages/core/src ${WORKSPACE}/packages/core/package.json /home/ubuntu/Business-Aaochat-Meet-Beta/livekit-react-core
                    sudo git add .
                    sudo git commit -m "Yarn built update from jenkins for core" || true
                    sudo git push origin business-develop'''
                sh '''cd /home/ubuntu/Business-Aaochat-Meet-Beta/livekit-react-components/
                    sudo git reset --hard business-develop
                    sudo git stash
                    sudo git pull origin business-develop
                    sudo rm -rf *
                    sudo cp -ra ${WORKSPACE}/packages/react/dist ${WORKSPACE}/packages/react/src ${WORKSPACE}/packages/react/etc ${WORKSPACE}/packages/react/api-extractor.json ${WORKSPACE}/packages/react/package.json /home/ubuntu/Business-Aaochat-Meet-Beta/livekit-react-components
                    sudo git add .
                    sudo git commit -m "Yarn built update from jenkins for components" || true
                    sudo git push origin business-develop'''
            }
        }
        stage('Trigger downstream job') {
            when {
                branch 'business-aaochat-dev'
            }
            steps {
                script {
                    def result = build job: 'W-business-meet.aaochat.com/develop'
                }
            }
        }
        stage("Master"){
            when {
                branch 'business-aaochat'
            }
            steps{
                echo "========executing business-aaochat branch========"
                sh '''yarn install'''
                sh '''yarn build'''
                sh '''cd /home/ubuntu/Business-Aaochat-Meet/livekit-react-core/
                    sudo git reset --hard business-master
                    sudo git stash
                    sudo git pull origin business-master
                    sudo rm -rf *
                    sudo cp -ra ${WORKSPACE}/packages/core/dist ${WORKSPACE}/packages/core/src ${WORKSPACE}/packages/core/package.json /home/ubuntu/Business-Aaochat-Meet/livekit-react-core
                    sudo git add .
                    sudo git commit -m "Yarn built update from jenkins for core" || true
                    sudo git push origin business-master'''
                sh '''cd /home/ubuntu/Business-Aaochat-Meet/livekit-react-components/
                    sudo git reset --hard business-master
                    sudo git stash
                    sudo git pull origin business-master
                    sudo rm -rf *
                    sudo cp -ra ${WORKSPACE}/packages/react/dist ${WORKSPACE}/packages/react/src ${WORKSPACE}/packages/react/etc ${WORKSPACE}/packages/react/api-extractor.json ${WORKSPACE}/packages/react/package.json /home/ubuntu/Business-Aaochat-Meet/livekit-react-components
                    sudo git add .
                    sudo git commit -m "Yarn built update from jenkins for components" || true
                    sudo git push origin business-master'''
            }
        }
        stage('Trigger downstream job') {
            when {
                branch 'business-aaochat'
            }
            steps {
                script {
                    def result = build job: 'W-business-meet.aaochat.com/master'
                }
            }
        }  
          
    }
    post {
        always {
            script {
                def data = [
                    "display_name": env.JOB_NAME,
                    "build" : [
                        "notes":"aaochat/react-components-aaochat-fork",
                        "phase": currentBuild.result,
                        "scm" : [
                            "url": env.GIT_URL,
                            "branch": env.GIT_BRANCH
                        ]
                    ]
                ]
                def json = JsonOutput.toJson(data)
                
                // Add conditions for different build results
                sh "curl -X POST -H 'Content-Type: ${CONTENT_TYPE}' -d '${json}' '${URL}'"
            }
        }
    }
}