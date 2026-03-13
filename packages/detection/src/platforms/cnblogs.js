import { convertAvatarToBase64 } from '../utils.js'

/**
 * Cnblogs (博客园) detection logic (offscreen approach)
 * Fetch https://account.cnblogs.com/user/userinfo via offscreen document,
 * where cookies are sent automatically in document context.
 */
export async function detectCnblogsUser() {
    try {
        console.log('[FaFaFa-全部发] Cnblogs Detection: Starting (offscreen)')

        if (typeof globalThis.__fafafaPublisherDetectCnblogs === 'function') {
            const result = await globalThis.__fafafaPublisherDetectCnblogs()
            if (result && result.loggedIn) {
                let avatar = result.avatar || ''
                if (avatar && avatar.includes('cnblogs.com')) {
                    avatar = await convertAvatarToBase64(avatar, 'https://www.cnblogs.com/')
                }
                console.log('[FaFaFa-全部发] Cnblogs: Logged in:', result.username)
                return { loggedIn: true, username: result.username || '', avatar }
            }
        }

        console.log('[FaFaFa-全部发] Cnblogs: Not logged in')
        return { loggedIn: false }
    } catch (e) {
        console.error('[FaFaFa-全部发] Cnblogs Detection Error:', e)
        return { loggedIn: false, error: e.message }
    }
}
