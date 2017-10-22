const unique = (val, index, self) => self.indexOf(val) === index

const extractIssueNumber = keyword => (toSearch = '') => {
  const lowerCasetoSearch = toSearch.toLowerCase()
  const lowerCaseKeyword = keyword.toLowerCase()
  const index = lowerCasetoSearch.indexOf(`${lowerCaseKeyword} #`)

  if (index === -1) return null

  const startingSlicePosition = index + keyword.length + 2
  const choppedString = lowerCasetoSearch.slice(startingSlicePosition, lowerCasetoSearch.length)
  const splitString = choppedString.split('')
  const issueNumber = []

  for (let i = 0; i < splitString.length; i++) {
    if (isNaN(Number(splitString[i]))) {
      break
    }

    issueNumber.push(splitString[i])
  }

  return Number(issueNumber.join(''))
}

function extractIssueNumbers(textBlock = '', keywords) {
  return keywords
    .reduce((accumulator, keyword) => {
      const extractFunc = extractIssueNumber(keyword)

      return textBlock
        .split('\n')
        .map(extractFunc)
        .filter(val => val !== null)
        .concat(accumulator)
    }, [])
    .filter(unique)

}

module.exports = {
  extractIssueNumber,
  extractIssueNumbers,
}
