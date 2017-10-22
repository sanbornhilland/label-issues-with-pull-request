# Label issues targeted by open pull requests

> A GitHub App built with [probot](https://github.com/probot/probot) that automatically labels issues targeted by currently open pull requests. See at a glance which open issues are addressed by an open pull request.

[![Build Status](https://travis-ci.org/sanbornhilland/label-issues-with-pull-request.svg?branch=master)](https://travis-ci.org/sanbornhilland/label-issues-with-pull-request)

## THIS IS STILL A WORK IN PROGRESS

## Table of Contents

1. [Usage](#usage)
1. [Configuration](#configuration)
1. [Setup](#setup)

## Usage
1. Navigate to the app [GitHub Apps - Label issues with targeted PR](https://github.com/apps/label-issues-targeted-by-open-prs)
1. Accept permissions
1. Allow access to the repository

Once the app is installed you can continue to work as usual, closing issues using the standard GitHub [keywords](https://help.github.com/articles/closing-issues-using-keywords/). For example, including `Closes #10` in a commit message will automatically close issue `#10` when it is merged as part of a pull request. While the pull request is open this app will apply a label to issue `#10`, allowing you to see at a glance all the issues that will eventually be closed as a result of currently open pull requests.

## Configuration
To configure the app, add a `labelPullRequests` object in your `.github/config.yml` file.

### Defaults
```yaml
labelPullRequests:
    # This label will be applied to issues addressed by an open PR.
    labelName: pull request open
    labelColor: f767eb

    # List of keywords that will trigger pull requests to be labeled.
    # E.g. Closes #10
    #
    # The default list comprises the keywords that GitHub
    # tracks for automatically closing pull requests but you could
    # include custom keywords if desired. However, they will
    # not automatically be closed when the pull request is merged.
    #
    # These are treated case-insensitively.
    # E.g. both Closes #10 and closes #10 will be used.
    keywords:
      - Close
      - Closes
      - Closed
      - Fix
      - Fixes
      - Fixed
      - Resolve
      - Resolves
      - Resolved
```


## Setup

#### Install dependencies
npm install

#### Run the bot
npm start
```

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this app.
