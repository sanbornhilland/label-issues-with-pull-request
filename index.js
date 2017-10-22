const parser = require('./parser.js')

const LABEL = 'pull request open'
const PINK = 'f767eb'

async function getClosedIssues(context) {
  const issueInfo = context.issue()
  const commits = await context.github.pullRequests.getCommits(issueInfo)

  const filteredMessages = commits.data
    .map(({ commit }) => commit.message.toLowerCase())
    .join('\n')

  return parser.extractIssueNumbers(filteredMessages)
}

async function createLabelIfNecessary(context) {
  const repoInfo = context.repo()
  const labels = await context.github.issues.getLabels(repoInfo)

  if (!labels.data.some(({ name }) => name === LABEL)) {
    await context.github.issues.createLabel({
      ...repoInfo,
      name: LABEL,
      color: PINK,
    })
  }
}

module.exports = (robot) => {
  robot.on('pull_request.closed', async context => {
    const closedIssues = await getClosedIssues(context)

    closedIssues.forEach((issue) => {
      context.github.issues.removeLabel(context.repo({
        number: issue,
        name: LABEL,
      }))
    })
  })

  robot.on('pull_request.opened', async context => {
    const repoInfo = context.repo()
    const closedIssues = await getClosedIssues(context)
    await createLabelIfNecessary(context)

    closedIssues.forEach((issue) => {
      context.github.issues.addLabels({
        ...repoInfo,
        number: issue,
        labels: [LABEL],
      })
    })
  })
}
