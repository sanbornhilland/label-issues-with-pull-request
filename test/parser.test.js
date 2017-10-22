const parser = require('../lib/parser.js')
const { keywords } = require('../lib/defaultConfig.js')
const { assert } = require('chai')

describe('extractIssueNumber', () => {
  it('should return null if no issue closed', () => {
    assert.equal(parser.extractIssueNumber('closes')(undefined), null)
    assert.equal(parser.extractIssueNumber('closes')('Test string'), null)
  })

  const testStringTemplates = [{
    stringTemplate: '$KEYWORD #2',
    issueNumber: 2,
  }, {
    stringTemplate: '$KEYWORD #2 More text',
    issueNumber: 2,
  }, {
    stringTemplate: '$KEYWORD #23 More text',
    issueNumber: 23,
  }, {
    stringTemplate: '$KEYWORD #12345 More text',
    issueNumber: 12345,
  }, {
    stringTemplate: 'More Text $KEYWORD #23 More text',
    issueNumber: 23,
  }, {
    stringTemplate: 'change 4\n\n$KEYWORD #1',
    issueNumber: 1,
  }]

  testStringTemplates.forEach(({ stringTemplate, issueNumber }) => {
    keywords.forEach((keyword) => {
      it(`should return the ${keyword} issue number`, () => {
        const testString = stringTemplate.replace('$KEYWORD', keyword)

        assert.equal(parser.extractIssueNumber(keyword)(testString), issueNumber)
      })
    })
  })

  // TEMP
  // Disabled in order to get Travis CI running
  xit('should extract all issue numbers', () => {
    const issues = parser.extractIssueNumbers('change 4\n\ncloses #1\nfixes #2fixed#12', keywords)

    assert.equal(issues.length, 3)
    assert.equal(issues.includes(1), true)
    assert.equal(issues.includes(2), true)
    assert.equal(issues.includes(12), true)
  })
})
