const LOCALE_SEGMENT = /^\/(en|fr|nl)(?=\/|$)/

/**
 * Return `href` with its locale path segment replaced by `locale`, keeping the
 * query string and hash (search filters, paging and the search context of
 * detail pages). Returns null when the path has no locale segment.
 */
export function switchLocaleUrl(href: string, locale: string): string | null {
    const url = new URL(href)
    if (!LOCALE_SEGMENT.test(url.pathname)) {
        return null
    }
    url.pathname = url.pathname.replace(LOCALE_SEGMENT, '/' + locale)
    return url.toString()
}

/** `url` moved to `locale` when it has a locale segment, otherwise unchanged. */
export function localizeUrl(url: string, locale: string): string {
    return switchLocaleUrl(url, locale) ?? url
}

/**
 * Make the navbar language links (`[data-locale-switch]`) switch to the
 * *current* URL at click time. The server-rendered href does not know about
 * search state pushed with history.pushState afterwards, nor about the hash.
 */
export function initLocaleSwitch(root: ParentNode = document): void {
    root.querySelectorAll<HTMLAnchorElement>('a[data-locale-switch]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const target = switchLocaleUrl(window.location.href, link.dataset.localeSwitch as string)
            if (target) {
                event.preventDefault()
                window.location.href = target
            }
        })
    })
}
