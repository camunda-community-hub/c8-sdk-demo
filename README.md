# Camunda 8 SDK for Node.js Demo

This is a demo of the [Camunda 8 SDK for Node.js](https://www.npmjs.com/package/camunda-8-sdk).

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

