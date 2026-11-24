export interface ToolGroup {
  title: string
  items: readonly string[]
}

export const toolGroups: readonly ToolGroup[] = [
  { title: 'Languages', items: ['Go', 'Python', 'TypeScript'] },
  { title: 'Frontend', items: ['Vue', 'Nuxt', 'Tailwind CSS'] },
  { title: 'Cloud', items: ['AWS Lambda', 'API Gateway', 'EventBridge'] },
  {
    title: 'Practice',
    items: ['Clean Architecture', 'REST APIs', 'Unit tests', 'Observability and metrics', 'Database design'],
  },
]

export const spokenLanguages = 'Spanish, native. English, technical.'
