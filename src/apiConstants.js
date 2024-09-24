
export const BASE_URL = 'http://127.0.0.1:8000';

export const URLS = {
    LOGIN: `${BASE_URL}/api/token/`,
    REGISTER: `${BASE_URL}/api/register/`,
    ALL_PASSWORDS: `${BASE_URL}/api/password-items/`,
    PASSWORD_GROUP_UNLISTED: `${BASE_URL}/api/password-items/unlisted/`,
    GROUP: `${BASE_URL}/api/groups/`,
    GENERATE_PASSWORD: `${BASE_URL}/api/password-items/generate/`,
    // Use functions to generate dynamic URLs with groupId and passId
    PASSWORD_FROM_GROUP: (groupId) => `${BASE_URL}/api/groups/${groupId}/password-items/`,
    PASSWORD_BY_ID: (groupId, passId) => `${BASE_URL}/api/groups/${groupId}/password-items/${passId}/`,
    PASSWORD_NO_GROUP: (passId) => `${BASE_URL}/api/password-items/${passId}/`,
    GROUP_BY_ID: (groupId) => `${BASE_URL}/api/groups/${groupId}/`,
    HISTORY: (passwordId) => `${BASE_URL}/api/password-history/${passwordId}`,
};


