export function useUrlGenerator(
    initRoutes: Object
){

    const routes = initRoutes

    const getRoute = (route: string) => routes[route] ?? ''

    const createCharterUrl = (id: number | string) => getRoute('charter_get_single').replace('charter_id', id)
    const createTraditionUrl = (type: string, id: string | number): string => getRoute('tradition_get_single').replace('tradition_type', type).replace('tradition_id', id)

    const createMapUrl = (latitude: number, longitude: number, zoom: number = 16): string => {
        const baseUrl = 'https://www.google.com/maps';
        return `${baseUrl}/@${latitude},${longitude},${zoom}z`;
    }

    return {
        getRoute,
        createCharterUrl,
        createTraditionUrl,
        createMapUrl,
    }
}