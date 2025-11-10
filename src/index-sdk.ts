import { Camunda8, OrchestrationLifters } from '@camunda8/sdk'

const camunda = new Camunda8().getOrchestrationClusterApiClient()

// Job worker
const worker = camunda.createJobWorker({
    jobType: 'service-task',
    workerName: 'test-worker',
    maxParallelJobs: 20,
    pollIntervalMs: 1000,
    pollTimeoutMs: 50_000,
    jobTimeoutMs: 5000,
    jobHandler: (job) => {
        console.log(`[worker]: Completing job ${job.jobKey} from process ${job.processInstanceKey}\n`)
        return job.complete({
            someNumberField: -1,
        })
    },
})

async function main() {
    const res = await camunda.deployResourcesFromFiles([
        './resources/c8-sdk-demo.bpmn',
    ]);
    const { processDefinitionKey } = res.processes[0];
    const { processInstanceKey } = await camunda.createProcessInstance({
        processDefinitionKey,
        variables: {
            userTaskCompleted: false,
        },
    });
    console.log(`\nStarted process ${processInstanceKey}\n`)

    // User task poller
    const last = new Set<OrchestrationLifters.UserTaskKey>();
    const userTaskPoller = camunda.searchUserTasks(
        {
            filter: {
                state: 'CREATED',
            },
        },
        {
            // To set up a subscription, set waitUpToMs to Infinity
            consistency: {
                waitUpToMs: Infinity,
                pollIntervalMs: 1_000,
                // predicate now becomes a polling subscription function
                predicate: async (results) => {
                    // polling memoization - handles idempotency with eventually consistent mutation
                    const current = results.items.filter((item) => !last.has(item.userTaskKey));
                    last.clear();
                    results.items.forEach((task) => last.add(task.userTaskKey));
                    for (const userTask of current) {
                        console.log(
                            `[usertask poller]: Claiming task ${userTask.userTaskKey} from process ${userTask.processInstanceKey}\n`
                        );
                        await camunda.assignUserTask({
                            userTaskKey: userTask.userTaskKey,
                            assignee: 'jwulf',
                        });

                        console.log(
                            `[usertask poller]: Completing user task ${userTask.userTaskKey} from process ${userTask.processInstanceKey}\n`
                        );
                        await camunda.completeUserTask({
                            userTaskKey: userTask.userTaskKey,
                            variables: {
                                userTaskCompleted: true,
                            },
                        });
                    }
                    return false; // return false to keep polling
                },
            },
        }
    )
    userTaskPoller.catch(e => {
        if (e.name === 'CancelSdkError') {
            return // swallow cancelation
        }
    })

    // Wait for our process to be completed
    await camunda.searchProcessInstances(
        {
            filter: {
                processInstanceKey,
                state: 'COMPLETED',
            },
        },
        { consistency: { waitUpToMs: 10_000 } }
    );
    console.log('Process completed, retrieving variables...\n');
    const variables = await camunda.searchVariables(
        {
            filter: {
                processInstanceKey,
            },
        },
        { consistency: { waitUpToMs: 5_000 } }
    );
    const finalValues = variables.items
        .map(item => ({ [item.name]: JSON.parse(item.value) }))
        .reduce((curr, prev) => ({ ...curr, ...prev }), {})
    console.log(`Process instance ${processInstanceKey} completed with variables:`, JSON.stringify(finalValues, null, 2));
    console.log(`\n`)
    userTaskPoller.cancel()
    worker.stop()
}

main()