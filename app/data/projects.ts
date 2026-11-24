export interface RepoLink {
  /** Rendered as "{labels joined with ' and '} on GitHub": "Source on GitHub", "Client and API on GitHub". */
  label: string
  href: string
}

export interface Project {
  id: string
  name: string
  /** Stack line under the name in the tab list. */
  stack: string
  summary: string
  /** The 3D stack, bottom layer first. The last layer is the top one. */
  layers: readonly [string, ...string[]]
  /** Public repositories only. */
  repos: readonly [RepoLink, ...RepoLink[]]
}

export const projects: readonly Project[] = [
  {
    id: 'umami-cloud-go',
    name: 'Self-hosted analytics on AWS',
    stack: 'Go, AWS CDK',
    summary: 'Infrastructure as code to deploy and manage a self-hosted Umami Analytics instance on AWS.',
    layers: ['AWS', 'CDK stack in Go', 'Umami Analytics'],
    repos: [{ label: 'Source', href: 'https://github.com/IlmarLopez/umami-cloud-go' }],
  },
  {
    id: 'serverless-transaction-notifications',
    name: 'Serverless transaction notifications',
    stack: 'Python, CloudFormation',
    summary: 'A serverless application deployed as code with CloudFormation and automated with CI/CD tools on AWS.',
    layers: ['AWS', 'CloudFormation', 'Python functions', 'CI/CD'],
    repos: [{ label: 'Source', href: 'https://github.com/IlmarLopez/serverless-transaction-notifications' }],
  },
  {
    id: 'utt-access-control',
    name: 'Building access control',
    stack: 'Vue, Go',
    summary: 'A web client and a RESTful API that control access to a university building.',
    layers: ['RESTful API in Go', 'Vue web client'],
    repos: [
      { label: 'Client', href: 'https://github.com/IlmarLopez/utt-access-control-client' },
      { label: 'API', href: 'https://github.com/IlmarLopez/utt-access-control-server' },
    ],
  },
  {
    id: 'portfolio',
    name: 'This portfolio',
    // Every technology named here must be in package.json (AC-24, Q11): the motion is plain CSS.
    stack: 'Nuxt, Tailwind, CSS motion',
    summary: 'Prerendered and versioned, with every edition kept alive.',
    layers: ['Nuxt, prerendered', 'Tailwind CSS', 'CSS motion'],
    repos: [{ label: 'Source', href: 'https://github.com/IlmarLopez/ilmarlopez.github.io' }],
  },
]
