import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class FetchingService {
    constructor(private http: HttpClient) {};

    async fetchData(url: string) {
        return this.http.get(url).toPromise();
    };

    async postData(url: string, body: any) {
        return this.http.post(url, body).toPromise();
    };

    async getCurrencyList() {
        return await this.fetchData(`${environment.hostUrl}api/currencyList`);
    };

    async getCurrencyUpdate() {
        return await this.fetchData(`${environment.hostUrl}api/updateCurrencies`);
    };

    async postLogs(body) {
        return await this.postData(`${environment.hostUrl}api/collectLogs`, body);
    }
}