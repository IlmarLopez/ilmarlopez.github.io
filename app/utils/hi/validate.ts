/**
 * The checks and the words of the "Say hi" form. No DOM here: the dialog decides when to show them.
 * The copy is the one approved in design/hallmark/f/.
 */

export type HiField = 'name' | 'email' | 'message'

export const HI_FIELDS: readonly HiField[] = ['name', 'email', 'message']

export type HiProblem = 'empty' | 'format'

/** What each field says about itself while it is fine. A problem replaces this line, it does not add a second one. */
export const HI_HELP: Record<HiField, string> = {
  name: 'What I should call you.',
  email: 'Only used to reply to you.',
  message: 'What you have in mind, in a few lines.',
}

const PROBLEMS: Record<HiField, Record<HiProblem, string>> = {
  // A name has no format to get wrong, so both entries are the same sentence.
  name: { empty: 'Add your name so I can reply.', format: 'Add your name so I can reply.' },
  email: { empty: 'Add your email so I can reply.', format: 'Write it as name@example.com.' },
  message: { empty: 'Write a few words so I know what this is about.', format: 'Write a few words so I know what this is about.' },
}

// Something, an @, something, a dot, something. The server checks the rest; this only catches typos.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** What is wrong with `value`, or null when it is fine. Surrounding whitespace does not count as content. */
export function problemOf(field: HiField, value: string): HiProblem | null {
  const trimmed = value.trim()
  if (!trimmed) return 'empty'
  if (field === 'email' && !EMAIL.test(trimmed)) return 'format'
  return null
}

export const problemMessage = (field: HiField, problem: HiProblem): string => PROBLEMS[field][problem]
