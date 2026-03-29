export const ACTION_MESSAGES = {
  created: 'created successfully',
  updated: 'updated successfully',
  deleted: 'deleted successfully',
  retrieved: 'retrieved successfully',
  notFound: 'not found',
} as const;

export type Action = keyof typeof ACTION_MESSAGES;