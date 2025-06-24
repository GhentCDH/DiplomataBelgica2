export function formatSource(edition: any) {
    var res: any[] = [];
    if(edition.names_editors) {
        res.push(edition.names_editors);
    }
    if(edition.date_of_edition_year) {
        res.push(edition.date_of_edition_year);
    }
    if(res.length > 0) {
        return res.join(', ');
    } else {
        return '';
    }
}

export function formatDate(date: any) {
    let res = date.year ?? ''
    if (date.month)  {
        res = `${date.month}/${res}`
    }
    if (date.day) {
        res = `${date.day}/${res}`
    }
    return res
}

export function formatDates(dates: any[]) {
    return dates.map(formatDate)
}

export function formatDatations(datations: any[]) {
    return datations.map(datation => {
        let res = formatDate(datation.time)
        if (datation.time.interpretation) {
            res += ` (${datation.time.interpretation}${datation.researcher ? ' - ' + datation.researcher : ''})`
        }
        return res
    })
}

export type TraditionUrlGenerator = (type: string, id: string) => string;

export function formatOriginal(original: any, createTraditionUrl: TraditionUrlGenerator) {
    const parts: any[] = []
    if (original.repository?.location) {
        parts.push(original.repository.location)
    }
    if (original.repository?.name) {
        parts.push(original.repository.name)
    }
    if (original.repository_reference_number) {
        parts.push(original.repository_reference_number)
    }
    const text = parts.join(', ')
    return text ? (original.id ? { text, link: createTraditionUrl('original', original.id) } : { text }) : null
}

export function formatCodex(codex: any, type: string, createTraditionUrl: TraditionUrlGenerator) {
    const parts: any[] = []
    if (codex.repository?.location) {
        parts.push(codex.repository.location)
    }
    if (codex.repository?.name) {
        parts.push(codex.repository.name)
    }
    if (codex.repository_reference_number) {
        parts.push(codex.repository_reference_number)
    }
    let line = parts.join(', ')
    if (codex.redaction_date) {
        line += (line ? ' ' : '') + `(${codex.redaction_date})`
    }
    return line ? (codex.id ? { text: line, link: createTraditionUrl(type, codex.id) } : { text: line }) : null
}

export function formatEdition(edition: any) {
    const parts: any[] = [], links: any[] = []
    if (edition.edition?.names_editors) {
        parts.push(edition.edition.names_editors)
    }
    if (edition.edition?.full_title) {
        parts.push(edition.edition.full_title)
    }
    if (edition.bookpart) {
        parts.push(edition.bookpart)
    }
    if (edition.nr) {
        parts.push(edition.nr)
    }
    if (edition.pages) {
        parts.push(edition.pages)
    }
    if (edition.edition?.urls) {
        links.push(...edition.edition.urls.map((u: any) => u.url).filter(Boolean))
    }
    if (edition.urls) {
        links.push(...edition.urls.map((u: any) => u.url).filter(Boolean))
    }
    return parts.length ? { text: parts.join(', '), links } : null
}

export function formatSecondaryLiterature(edition: any) {
    const parts: any[] = [], links: any[] = []
    if (edition.secondary_literature?.names_editors) {
        parts.push(edition.secondary_literature.names_editors)
    }
    if (edition.secondary_literature?.full_title) {
        parts.push(edition.secondary_literature.full_title)
    }
    if (edition.bookpart) {
        parts.push(edition.bookpart)
    }
    if (edition.nr) {
        parts.push(edition.nr)
    }
    if (edition.pages) {
        parts.push(edition.pages)
    }
    if (edition.secondary_literature?.urls) {
        links.push(...edition.secondary_literature.urls.map((u: any) => u.url).filter(Boolean))
    }
    if (edition.urls) {
        links.push(...edition.urls.map((u: any) => u.url).filter(Boolean))
    }
    return parts.length ? { text: parts.join(', '), links } : null
}

export function formatPlaceNormalised(place: any): string {
    let res = place.name ?? ''
    const localisation: any[] = []
    if (place.localisation?.land) {
        localisation.push(place.localisation.land.name)
    }
    if (place.localisation?.echelon_1) {
        localisation.push(place.localisation.echelon_1)
    }
    if (place.localisation?.echelon_2) {
        localisation.push(place.localisation.echelon_2)
    }
    if (localisation.length) {
        res += (res ? ' ' : '') + `(${localisation.join(', ')})`
    }
    return res
}