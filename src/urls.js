const HOST = "localhost"
const PORT = "8000"
const PROTOCOL = 'http'
const BASE_URL = `${PROTOCOL}://${HOST}:${PORT}/api`

export const PASSWORD_ITEMS = `${BASE_URL}/password-items/`
export const PASSWORD_HISTORY = (passwordId) => `${BASE_URL}/password-history/${passwordId}/`
export const PASSWORD_DELETE = (passId, groupId) => `${BASE_URL}/groups/${groupId}/password-items/${passId}/`
export const PASSWORD_UPDATE = (passId, groupId) => !!groupId
    ? `${BASE_URL}/groups/${groupId}/password-items/${passId}/`
    : `${BASE_URL}/password-items/${passId}/`