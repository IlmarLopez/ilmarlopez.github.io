export interface Profile {
  name: string
  jobTitle: string
  /** One sentence under the hero heading. */
  lead: string
  /** About copy, one entry per paragraph. */
  about: readonly [string, ...string[]]
  email: string
  contactPrompt: string
}

export const profile: Profile = {
  name: 'Ilmar Lopez',
  jobTitle: 'Senior Software Engineer',
  lead: 'Senior engineer at Stori, building serverless APIs in Go and Python.',
  about: [
    'I’m a Senior Software Engineer at Stori, a Mexican fintech, where I’ve worked across product and platform teams, from customer-facing features to architecture and finance integrations. I design and build APIs and serverless services in Go and Python on AWS.',
    'Before Stori I was a full stack developer and technical lead building educational platforms. I aspire to create impactful contributions.',
  ],
  email: 'me@ilmarlopez.com',
  contactPrompt: 'Have something to build?',
}
