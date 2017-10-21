const parser = require('./parser.js')

module.exports = (robot) => {
  robot.on('issues.opened', async context => {
    robot.log('Issue Opened event received')
    robot.log(context.payload)
    robot.log(context.issue.title)
  })

  robot.on('pull_request.opened', async context => {
    const { repository, number } = context.payload
    const { data } = await context.github.pullRequests.getCommits({
      owner: repository.owner.login,
      repo: repository.name,
      number,
    })

    const filteredMessages = data
      .map(({ commit }) => commit.message.toLowerCase())
      .join('\n')

    const closedIssues = parser.extractIssueNumbers(filteredMessages)

    robot.log('Closed issues ->', closedIssues)

    closedIssues.forEach((issue) => {
      context.github.issues.addLabels({
        owner: repository.owner.login,
        repo: repository.name,
        number: issue,
        labels: ['pull request open'],
      })
    })
  })
}
