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

async function createLabelIfNecessary(context, labelName, labelColor) {
  const repoInfo = context.repo()
  const labels = await context.github.issues.getLabels(repoInfo)

  if (!labels.data.some(({ name }) => name === labelName)) {
    await context.github.issues.createLabel({
      ...repoInfo,
      name: labelName,
      color: labelColor,
    })
  }
}

async function getUserConfig(context) {
  const userConfig = await context.config('config.yml')

  return userConfig && userConfig.labelPullRequests ? userConfig.labelPullRequests : {}
}

async function getConfig(context) {
  const userConfig = await getUserConfig(context)

  return {
    ...defaultConfig,
    ...userConfig,
  }
}

module.exports = (robot) => {
  robot.on('pull_request.closed', async context => {
    const { labelName, keywords } = await getConfig(context)
    const closedIssues = await getClosedIssues(context, keywords)

    closedIssues.forEach((issue) => {
      // I don't know why I can't do await with a try/catch here.
      context.github.issues.removeLabel(context.repo({
        number: issue,
        name: labelName,
      }))
      .catch(robot.error)
    })
  })

  robot.on('pull_request.opened', async context => {
    const { labelName, labelColor, keywords } = await getConfig(context)
    const closedIssues = await getClosedIssues(context, keywords)
    await createLabelIfNecessary(context, labelName, labelColor)
    const repoInfo = context.repo()

    closedIssues.forEach((issue) => {
      context.github.issues.addLabels({
        ...repoInfo,
        number: issue,
        labels: [labelName],
      })
    })
  })
}
