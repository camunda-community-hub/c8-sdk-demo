import { createCamundaClient, ProcessDefinitionKey } from '@camunda8/orchestration-cluster-api'

const camunda = createCamundaClient()

async function startInstance() {
    const res = await camunda.deployResourcesFromFiles([
        './resources/quote-from-website.bpmn',
    ]);
    console.log(res)

    const { processDefinitionId, processDefinitionKey} = res.processes[0]

    // User fills out form on website. We will start a process with their input

    const processInstance = await camunda.createProcessInstance({
        processDefinitionKey, 
        variables: {
            name: "Joe Bloggs",
            address: "Somewhere",
            request: "Concrete driveway" // If request is undefined, the quote will not be automatible. 
        }
    })

    console.log(processInstance)
}

async function main() {
    await startInstance()
    const triageWorker = camunda.createJobWorker({
        jobType: 'triage-automatibility',
        jobTimeoutMs: 30_000,
        maxParallelJobs: 1,
        jobHandler: job => {
            console.log({
                jobKey: job.jobKey,
                variables: job.variables
            })
            const isAutomatible = (job.variables.request != undefined)
            return job.complete({
                isAutomatable: isAutomatible
            })
        }
    })
}

main()

// Handle ZEEBE_REST_ADDRESS
// make  job.acknowledged private