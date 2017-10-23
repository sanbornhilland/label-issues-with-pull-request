const parser = require('./lib/parser.js')
const defaultConfig = require('./lib/defaultConfig.js')

async function getClosedIssues(context, keywords) {
  const issueInfo = context.issue()
  const commits = await context.github.pullRequests.getCommits(issueInfo)

  const filteredMessages = commits.data
    .map(({ commit }) => commit.message.toLowerCase())
    .join('\n')

  return parser.extractIssueNumbers(filteredMessages, keywords)
}

async function createLabelIfNecessary(context, robot, labelName, labelColor) {
  const repoInfo = context.repo()
  const labels = await context.github.issues.getLabels(repoInfo)

  if (!labels.data.some(({ name }) => name === labelName)) {
    robot.debug(`No label with name ${name} found. Creating a new label...`)

    await context.github.issues.createLabel({
      ...repoInfo,
      name: labelName,
      color: labelColor,
    })
  }
}

async function getUserConfig(context, robot) {
  const userConfig = await context.config('config.yml')

  robot.debug('User defined config values: ', userConfig)

  return userConfig && userConfig.labelPullRequests ? userConfig.labelPullRequests : {}
}

async function getConfig(context, robot) {
  const userConfig = await getUserConfig(context)

  const config = {
    ...defaultConfig,
    ...userConfig,
  }

  robot.debug('Using config: ', config)

  return config
}

module.exports = (robot) => {
  robot.on('pull_request.closed', async context => {
    const { labelName, keywords } = await getConfig(context, robot)
    const closedIssues = await getClosedIssues(context, keywords)

    robot.debug('[PR CLOSED] Issues closed by this PR: ', closedIssues)

    closedIssues.forEach((issue) => {
      robot.debug(`[PR CLOSED] Removing label ${labelName} from ${issue}`)
      // I don't know why I can't do await with a try/catch here.
      context.github.issues.removeLabel(context.repo({
        number: issue,
        name: labelName,
      }))
      .catch(robot.error)
    })
  })

  robot.on('pull_request.opened', async context => {
    const { labelName, labelColor, keywords } = await getConfig(context, robot)
    const closedIssues = await getClosedIssues(context, keywords)
    await createLabelIfNecessary(context, robot, labelName, labelColor)
    const repoInfo = context.repo()

    robot.debug('[PR OPENED] Issues that will be closed by this PR: ', closedIssues)

    closedIssues.forEach((issue) => {
      robot.debug(`[PR OPENED] Adding label ${labelName} to issue ${issue}`)

      context.github.issues.addLabels({
        ...repoInfo,
        number: issue,
        labels: [labelName],
      })
    })
  })
}
