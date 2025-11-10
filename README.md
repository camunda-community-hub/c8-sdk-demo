# Camunda 8 SDK for Node.js Demo

This is a demo of the [Camunda 8 SDK for Node.js](https://www.npmjs.com/package/@camunda8/sdk).

This demonstrates the use of the Orchestration Cluster (REST) API, available from Camunda 8.8 onward.

## Setup

- Clone the repository locally, then install dependencies:

```bash
npm i
```

- Download [Camunda Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/) to run Camunda 8 locally; or
- Run `docker-compose -f docker/docker-compose.yml up -d`; or
- Create a cluster in [Camunda SaaS](https://camunda.io).
    - Create an API client in the Web Console (instructions [here](https://docs.camunda.io/docs/next/guides/setup-client-connection-credentials/))

## Environment Configuration

Camunda Run: 

```bash
export ZEEBE_REST_ADDRESS='http://localhost:8088/v2'
```

Docker:

```bash
export ZEEBE_REST_ADDRESS='http:///localhost:8080/v2'
```

Camunda SaaS:

```bash
export ZEEBE_REST_ADDRESS='https://5c34c0a7-...-125615f7a9b9.syd-1.zeebe.camunda.io'
export ZEEBE_CLIENT_ID='yvvURO9TmBnP3...'
export ZEEBE_CLIENT_SECRET='iJJu-SHgUt...'
export CAMUNDA_OAUTH_URL='https://login.cloud.camunda.io/oauth/token'
```
Self-hosted with OAuth:

```bash
# Self-Managed
export ZEEBE_REST_ADDRESS='http://localhost:8088/v2'
export ZEEBE_CLIENT_ID='zeebe'
export ZEEBE_CLIENT_SECRET='zecret'
export CAMUNDA_OAUTH_URL='http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token'
```

## Operation

The application will deploy a BPMN process model to the cluster, then start an instance. A task worker services the first task. 

The next task in the process model is a human task. The program polls for new user tasks to claim, then completes the user task. This is accomplished by a "human task worker" that polls every second.

## Run

- Run the application with `npm start`
