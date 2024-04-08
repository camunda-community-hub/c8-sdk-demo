# Camunda 8 SDK for Node.js Demo

This is a demo of the [Camunda 8 SDK for Node.js](https://www.npmjs.com/package/@camunda8/sdk).

It requires a Camunda 8 Platform SaaS account, which you can get for free [here](https://signup.camunda.com/accounts).

## Setup

- Clone the repository locally, then install dependencies:

```bash
npm i
```

- Create a cluster in Camunda 8 Platform SaaS
- Create an API client in the Web Console (instructions [here](https://docs.camunda.io/docs/next/guides/setup-client-connection-credentials/))
- Put the client credentials environment variables in a file `.env` in the root of the project
- Run the application with `npm start`

## Operation

The application will deploy a BPMN process model to the cluster, then start an instance. A task worker services the first task. These operations use the Zeebe API.

The next task in the process model is a human task. The Tasklist API is used to claim, then complete the task. This is accomplished by a "human task worker" that polls every three seconds.

Finally, the Operate API is used to retrieve the XML of the process model.

## Credentials

Camunda SaaS:

```bash
export ZEEBE_ADDRESS='5c34c0a7-...-125615f7a9b9.syd-1.zeebe.camunda.io:443'
export ZEEBE_CLIENT_ID='yvvURO9TmBnP3...'
export ZEEBE_CLIENT_SECRET='iJJu-SHgUt...'
export CAMUNDA_TASKLIST_BASE_URL='https://syd-1.tasklist.camunda.io/5c34c0a7-...-125615f7a9b9'
export CAMUNDA_OPTIMIZE_BASE_URL='https://syd-1.optimize.camunda.io/5c34c0a7-...-125615f7a9b9'
export CAMUNDA_OPERATE_BASE_URL='https://syd-1.operate.camunda.io/5c34c0a7-...-125615f7a9b9'
export CAMUNDA_OAUTH_URL='https://login.cloud.camunda.io/oauth/token'
export CAMUNDA_MODELER_BASE_URL='https://modeler.cloud.camunda.io/api'
```
Self-hosted:

```bash
# Self-Managed
export ZEEBE_ADDRESS='localhost:26500'
export ZEEBE_CLIENT_ID='zeebe'
export ZEEBE_CLIENT_SECRET='zecret'
export CAMUNDA_OAUTH_URL='http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token'
export CAMUNDA_TASKLIST_BASE_URL='http://localhost:8082'
export CAMUNDA_OPERATE_BASE_URL='http://localhost:8081'
export CAMUNDA_OPTIMIZE_BASE_URL='http://localhost:8083'
export CAMUNDA_MODELER_BASE_URL='http://localhost:8070/api'

# Needed for Multi-Tenancy
export CAMUNDA_TENANT_ID='<default>'

# TLS for gRPC is on by default. If the Zeebe broker is not secured by TLS, turn it off
export CAMUNDA_SECURE_CONNECTION=false
```