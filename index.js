const parser = require('./lib/parser.js')
const defaultConfig = require('./lib/defaultConfig.js')

async function getClosedIssues(context, keywords) {
  const issueInfo = context.issue()
  const commits = await context.github.pullRequests.getCommits(issueInfo)
  const body = context.payload.pull_request.body.toLowerCase()

  const filteredMessages = commits.data
    .map(({ commit }) => commit.message.toLowerCase())
    .concat([body])
    .join('\n')

  return parser.extractIssueNumbers(filteredMessages, keywords)
}

async function createLabelIfNecessary(context, robot, labelName, labelColor) {
  const repoInfo = context.repo()
  const labels = await context.github.issues.getLabels({ ...repoInfo, per_page: 100 })

  if (!labels.data.some(({ name }) => name === labelName)) {
    robot.log.debug(`No label with name ${labelName} found. Creating a new label...`)

    await context.github.issues.createLabel({
      ...repoInfo,
      name: labelName,
      color: labelColor,
    })
  }
}

async function getUserConfig(context, robot) {
  const userConfig = await context.config('config.yml')

  robot.log.debug('User defined config values: ', userConfig)

  return userConfig && userConfig.labelPullRequests ? userConfig.labelPullRequests : {}
}

async function getConfig(context, robot) {
  const userConfig = await getUserConfig(context, robot)

  const config = {
    ...defaultConfig,
    ...userConfig,
  }

  robot.log.debug('Using config: ', config)

  return config
}

async function handleOpenedPr(robot, context) {
  const { labelName, labelColor, keywords } = await getConfig(context, robot)
  const closedIssues = await getClosedIssues(context, keywords)
  await createLabelIfNecessary(context, robot, labelName, labelColor)
  const repoInfo = context.repo()

  robot.log.debug('[PR OPENED] Issues that will be closed by this PR: ', closedIssues)

  closedIssues.forEach((issue) => {
    robot.log.debug(`[PR OPENED] Adding label ${labelName} to issue ${issue}`)

    context.github.issues.addLabels({
      ...repoInfo,
      number: issue,
      labels: [labelName],
    })
  })
}

module.exports = (robot) => {
  handleOpenedPr = handleOpenedPr.bind(null, robot)

  robot.on('pull_request.opened', handleOpenedPr)

  robot.on('pull_request.reopened', handleOpenedPr)

  robot.on('pull_request.edited', handleOpenedPr)

  robot.on('pull_request.closed', async context => {
    const { labelName, keywords } = await getConfig(context, robot)
    const closedIssues = await getClosedIssues(context, keywords)

    robot.log.debug('[PR CLOSED] Issues closed by this PR: ', closedIssues)

    closedIssues.forEach((issue) => {
      robot.log.debug(`[PR CLOSED] Removing label ${labelName} from ${issue}`)
      // I don't know why I can't do await with a try/catch here.
      context.github.issues.removeLabel(context.repo({
        number: issue,
        name: labelName,
      }))
      .catch(robot.error)
    })
  })
}
