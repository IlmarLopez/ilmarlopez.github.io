export interface Photo {
  /** Served from `public/`. The original is a 5 MB camera file: it is only ever requested through NuxtPicture. */
  src: string
  alt: string
  /** The rendered size in CSS pixels. It also fixes the aspect ratio (3:4) so the page does not shift. */
  width: number
  height: number
}

export interface Profile {
  name: string
  jobTitle: string
  /** One sentence under the hero heading. */
  lead: string
  /** About copy, one entry per paragraph. */
  about: readonly [string, ...string[]]
  photo: Photo
  email: string
  contactPrompt: string
}

export const profile: Profile = {
  name: 'Ilmar Lopez',
  jobTitle: 'Senior Software Engineer',
  lead: 'Senior engineer at Stori, building serverless APIs in Go and Python.',
  about: [
    'I’m a Senior Software Engineer at Stori, a Mexican fintech, on the architecture team. I design APIs and serverless services with Clean Architecture in Go and Python on AWS.',
    'Before Stori I was a full stack developer and technical lead building educational platforms. I aspire to create impactful contributions.',
  ],
  photo: {
    src: '/img/hero/me.jpg',
    alt: 'Portrait of Ilmar Lopez wearing aviator glasses with tinted lenses and a cream shirt with a dark blue brush pattern.',
    width: 360,
    height: 480,
  },
  email: 'me@ilmarlopez.com',
  contactPrompt: 'Have something to build?',
}
