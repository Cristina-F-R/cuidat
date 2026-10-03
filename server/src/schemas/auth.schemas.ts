import { z } from 'zod'

const localIdSchema = z.string().trim().min(1).max(100)

export const loginSchema = z.object({
  email: z.string().trim().email().max(255).transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(128),
}).strict()

const guestProfileSchema = z.object({
  id: localIdSchema,
  name: z.string().trim().min(1).max(100),
  type: z.enum(['pet', 'child', 'adult', 'custom']),
  avatarIcon: z.string().min(1).max(50),
}).strict()

const guestItemSchema = z.object({
  id: localIdSchema,
  calendarId: localIdSchema.optional(),
  name: z.string().trim().min(1).max(100),
  emoji: z.string().min(1).max(10),
  category: z.enum(['symptom', 'trigger', 'medication']),
  isActive: z.boolean(),
}).strict()

const guestEventSchema = z.object({
  id: localIdSchema,
  calendarId: localIdSchema,
  itemDefinitionId: localIdSchema,
  loggedAt: z.iso.datetime({ offset: false }).refine((value) => value.endsWith('Z'), 'Timestamp must be UTC.'),
  intensity: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  notes: z.string().max(300),
}).strict()

export const guestStateSchema = z.object({
  profiles: z.array(guestProfileSchema).max(10),
  activeProfileId: localIdSchema.nullable(),
  itemDefinitions: z.array(guestItemSchema).max(150),
  events: z.array(guestEventSchema).max(500),
  authMode: z.enum(['guest', 'demo']),
}).strict().superRefine((state, context) => {
  const profileIds = new Set(state.profiles.map((profile) => profile.id))
  const itemIds = new Set(state.itemDefinitions.map((item) => item.id))
  if (new Set(state.profiles.map((profile) => profile.id)).size !== state.profiles.length) {
    context.addIssue({ code: 'custom', message: 'Profile IDs must be unique.', path: ['profiles'] })
  }
  if (new Set(state.itemDefinitions.map((item) => item.id)).size !== state.itemDefinitions.length) {
    context.addIssue({ code: 'custom', message: 'Definition IDs must be unique.', path: ['itemDefinitions'] })
  }
  if (state.activeProfileId && !profileIds.has(state.activeProfileId)) {
    context.addIssue({ code: 'custom', message: 'Active profile must belong to the guest payload.', path: ['activeProfileId'] })
  }
  for (const [index, item] of state.itemDefinitions.entries()) {
    if (item.calendarId && !profileIds.has(item.calendarId)) {
      context.addIssue({ code: 'custom', message: 'Definition profile is not in the guest payload.', path: ['itemDefinitions', index, 'calendarId'] })
    }
  }
  for (const [index, event] of state.events.entries()) {
    if (!profileIds.has(event.calendarId) || !itemIds.has(event.itemDefinitionId)) {
      context.addIssue({ code: 'custom', message: 'Event references must belong to the guest payload.', path: ['events', index] })
    }
  }
})

export const upgradeSchema = z.object({
  email: z.string().trim().email().max(255).transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(128),
  guestState: guestStateSchema,
}).strict()

export type LoginInput = z.infer<typeof loginSchema>
export type UpgradeInput = z.infer<typeof upgradeSchema>