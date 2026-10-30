// map pin colours per actor role (1 = disposant, 2 = issuer, 3/4 = beneficiary)
// the marker-*.png icons in assets/icons are marker3.png recoloured with these colours

export type RoleKey = 'issuer' | 'disposant' | 'beneficiary' | 'mixed'

export const ROLE_COLOURS: Record<RoleKey, string> = {
    issuer: '#2c6e8f',
    disposant: '#c0392b',
    beneficiary: '#2e8b57',
    mixed: '#7f8c8d',
}

export const ROLE_ICON: Record<RoleKey, string> = {
    issuer: 'marker-issuer',
    disposant: 'marker-disposant',
    beneficiary: 'marker-beneficiary',
    mixed: 'marker-mixed',
}

const ROLE_KEYS: Record<number, RoleKey> = {
    1: 'disposant',
    2: 'issuer',
    3: 'beneficiary',
}

// role 4 is a second beneficiary role
export const normaliseRole = (roleId: number): number => roleId === 4 ? 3 : roleId

export const roleKey = (roleId: number): RoleKey | null => ROLE_KEYS[normaliseRole(roleId)] ?? null

// colour of a place: the selected role, the single role of its actors, or mixed
export const placeRoleKey = (roleIds: number[], roleFilter = 0): RoleKey | null => {
    if (roleFilter) {
        return roleKey(roleFilter)
    }
    const keys = new Set(roleIds.map(roleKey).filter(key => key !== null))
    if (keys.size === 0) {
        return null
    }
    return keys.size === 1 ? [...keys][0] : 'mixed'
}

// maplibre 'icon-image' expression: role coloured pin from the feature's roleKey, otherwise the fallback image
export const roleIconImage = (fallbackImage: string) => [
    'match', ['get', 'roleKey'],
    ...(Object.entries(ROLE_ICON).flat()),
    fallbackImage,
]
