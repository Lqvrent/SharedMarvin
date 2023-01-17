# Welcome to the hosting guide for the SharedMarvin project
## Prerequisites 📋
First of all, you need Docker and Docker Compose installed on your machine. You can find the installation guide [here](https://docs.docker.com/compose/install/).
###### TODO: Generate SSL certificates
###### TODO: Azure app registration
###### TODO: First launch with Jenkins (for the API key)

## Configuration ⚙️
Then, after cloning the project, you will need to create a `.env` file, that can be copied from the `.env.example` file.
```bash
cp .env.example .env
```
Here are the details of the variables:
| Variable | Description | Recommended value |
| --- | --- | --- |
| `JENKINS_USER_ID` | Your Jenkins user ID, used to authenticate to Jenkins | |
| `JENKINS_USER_NAME` | The display name of your Jenkins user | |
| `JENKINS_USER_PASSWORD` | Your Jenkins user password, used to authenticate to Jenkins | A **very** strong password |
| `JENKINS_NB_SLAVES` | The number of Jenkins slaves to run the tests | 1 for local, the most possible in production |
| `JENKINS_URL` | The name of the Jenkins slaves | `http://localhost:8080` for local, the URL of the Jenkins server in production (but should finish by the port too) |
| `JENKINS_API_TOKEN` | The API token of your Jenkins user | On the first launch, go to `http://localhost:8080/me/configure` and generate a new API Token, and paste it here |
| `DOCKER_SOCK` | The path to the Docker socket, used to create container to run the tests | `/var/run/docker.sock`, if not found, search it with `find / -name "*docker.sock*"` |
| `POSTGRES_USER` | The username of the PostgreSQL database | |
| `POSTGRES_PASSWORD` | The password of the PostgreSQL database | A **very** strong password |
| `BRIDGE_URL` | The URL of the Bridge API | `http://localhost:3000` for local, the URL of the Bridge API in production (but should finish by the port too) |
| `WAITING_TIME` | The time to wait between each tests trigger | 0 for local, 420 (7hrs) in production |
| `SSL_CERTIFICATE` | The path to the SSL certificate (fullchain.pem), created in the Prerequisites section | |
| `SSL_KEY` | The path to the SSL key (privkey.pem), created in the Prerequisites section | |
| `DOMAIN` | The domain of the SSL certificate | `localhost` in loca, your domain in production |
| `ADMINISTRATORS` | A comma separated list of the administrators emails | Your Epitech's email |

You also have to configure the Interface. Since she is static, we can't use environment variables. So you will have to edit the `Interface/src/environments/environment.prod.ts` file, and change the values of the variables.
| Variable | Description |
| --- | --- |
| `production` | Boolean, should always be true (for obscure reasons) |
| `bridge_url` | Same as `BRIDGE_URL` in the `.env` file |
| `MSAL_clientId` | Application (client) ID from the app registration made in the Prerequisites section |
| `MSAL_authority` | Tenant ID from the app registration |
| `MSAL_redirectUr` | Redirect URI from the app registration |
| `MS_graphEndpoint` | The Microsoft Graph API endpoint, should always be `https://graph.microsoft.com` as January 2023 |

## 🛠️ Building
Now, you can build the project with Docker Compose:
```bash
docker-compose build
```
**Note**: When modifying environment variables, you're not supposed to rebuild the project, but you can do it if you want.

## 🚀 Running
And finally, you can run the project with Docker Compose:
```bash
docker-compose up
```
**Note**: You can add the `-d` flag to run the project in the background.
If you want to stop the project, you can use the following command:
```bash
docker-compose down
```
