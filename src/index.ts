import {Camunda8} from '@camunda8/sdk'

import chalk from 'chalk'
import * as path from 'path'
import { config } from 'dotenv' 
config()

const c8 = new Camunda8()
const zbc = c8.getZeebeGrpcApiClient()
const operate = c8.getOperateApiClient()
const optimize = c8.getOptimizeApiClient() // unused
const tasklist = c8.getTasklistApiClient()

const getLogger = (prefix: string, color: chalk.Chalk) => (msg: string) => console.log(color(`[${prefix}] ${msg}`))

async function main() {
    const log = getLogger('Zeebe', chalk.greenBright) 
    zbc 
    const res = await zbc.deployResource({
        processFilename: path.join(process.cwd(), 'resources', 'c8-sdk-demo.bpmn') 
    })
    log(`Deployed process ${res.deployments[0].process.bpmnProcessId}`)

    const p = await zbc.createProcessInstanceWithResult({
        bpmnProcessId: `c8-sdk-demo`, 
        variables:{
            humanTaskStatus: 'Needs doing'
        }
    })

    log(`Finished Process Instance ${p.processInstanceKey}`)
    log(`humanTaskStatus is "${p.variables.humanTaskStatus}"`)
    log(`serviceTaskOutcome is ${p.variables.serviceTaskOutcome}`)

    await new Promise(res => setTimeout(() => res(null), 5000))
    const historicalProcessInstance = await operate.getProcessInstance(p.processInstanceKey).catch(e => {
        if (e.response.body.status === 404) {
            log(chalk.redBright(`[Operate] ${e.response.body.message}`))
            return null
        }
    })
    console.log(historicalProcessInstance)
    if (historicalProcessInstance?.state == 'COMPLETED') {
        const variables = await operate.getJSONVariablesforProcess(historicalProcessInstance.key)
        log(chalk.redBright('\n[Operate] Variables:', JSON.stringify(variables, null, 2)))
    }

    const bpmn = await operate.getProcessDefinitionXML(p.processDefinitionKey)

    log(chalk.redBright('\n[Operate] BPMN XML:', bpmn))
}

console.log(`Creating worker...`)
zbc.createWorker({
    taskType: 'service-task',
    taskHandler: job => {
        const log = getLogger('Zeebe Worker', chalk.blueBright)
        log(`handling job of type ${job.type}`)
        return job.complete({
            serviceTaskOutcome: 'We did it!'
        })
    }
})

console.log(`Starting human task poller...`)
setInterval(async () => {
    const log = getLogger('Tasklist', chalk.yellowBright)
    const res = await tasklist.searchTasks({
        state: 'CREATED'
    })
    if (res.length > 0) {
        log(`fetched ${res.length} human tasks`)
        res.forEach(async task => {
            log(`claiming task ${task.id} from process ${task.processInstanceKey}`)
            const t = await tasklist.assignTask({
                taskId: task.id, 
                assignee: 'demobot',
                allowOverrideAssignment: true
            })
            log(`servicing human task ${t.id} from process ${t.processInstanceKey}`)
            await tasklist.completeTask(t.id, {
                humanTaskStatus: 'Got done'
            })
        })
    } else {
        log('No human tasks found')
    }
}, 3000)



main()