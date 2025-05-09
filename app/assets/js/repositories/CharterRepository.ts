import BaseRepository from './BaseRepository';
import type {AxiosResponse} from "axios";

class CharterRepository extends BaseRepository {

    public async get(id: string): Promise<AxiosResponse> {
        const locale = this.getLocale();
        const config = this.getRequestConfig();
        return await this.axiosInstance.get(`/${locale}/charters/${id}`, config);
    }

    public async search(query: object): Promise<AxiosResponse> {
        const locale = this.getLocale();
        const config = this.getRequestConfig();
        return await this.axiosInstance.get(`/${locale}/charters/search`, {
            ...config,
            params: query,
        });
    }

    public async locate(filters: object): Promise<AxiosResponse> {
        const locale = this.getLocale();
        const config = this.getRequestConfig();
        const payload = { filters };
        return await this.axiosInstance.get(`/${locale}/charters/locate`, {
            ...config,
            params: payload,
        });
    }

    public async autocomplete(field: string, fieldFilter: string, filters: object): Promise<AxiosResponse> {
        const locale = this.getLocale();
        const config = this.getRequestConfig();
        const payload = {
            field,
            value: fieldFilter,
            filters,
        };
        return await this.axiosInstance.get(`/${locale}/charters/aggregation_suggest`, {
            ...config,
            params: payload,
        });
    }
}

export default new CharterRepository();
