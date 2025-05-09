import BaseRepository from './BaseRepository';
import type {AxiosResponse} from "axios";

class TraditionRepository extends BaseRepository {

    public async get(id: string): Promise<AxiosResponse> {
        const locale = this.getLocale();
        const config = this.getRequestConfig();
        return await this.axiosInstance.get(`/${locale}/traditions/${id}`, config);
    }

    public async search(query: object): Promise<AxiosResponse> {
        const locale = this.getLocale();
        const config = this.getRequestConfig();
        return await this.axiosInstance.get(`/${locale}/traditions/search`, {
            ...config,
            params: query,
        });
    }
}

export default new TraditionRepository();
