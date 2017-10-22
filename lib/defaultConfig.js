module.exports = {
  // List of keywords that will trigger PRs to be labeled.
  // E.g. Closes #10
  //
  // The default list is comprises the keywords that GitHub
  // tracks for automatically closing PRs but you could
  // include custom keywords if desired.
  //
  // These are treated case-insensitively.
  // E.g. both Closes #10 and closes #10 will be used.
  keywords: [
    'Close',
    'Closes',
    'Closed',
    'Fix',
    'Fixes',
    'Fixed',
    'Resolve',
    'Resolves',
    'Resolved',
  ],

  // This label will be applied to issues addressed by an open PR.
  labelName: 'pull request open',
  labelColor: 'f767eb',
}
