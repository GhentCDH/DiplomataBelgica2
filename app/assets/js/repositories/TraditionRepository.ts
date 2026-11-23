import BaseRepository from './BaseRepository';
import type {AxiosResponse} from "axios";

class TraditionRepository extends BaseRepository {

    public async get(type: string, id: string | number): Promise<AxiosResponse> {
        const locale = this.getLocale();
        const config = this.getRequestConfig();
        return await this.axiosInstance.get(`/${locale}/tradition/${type}/${id}`, config);
    }
}

export default new TraditionRepository();
