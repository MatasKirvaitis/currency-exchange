import { Component, OnInit } from '@angular/core';
import { FetchingService } from '../../services/fetching.service';
import { environment } from '../../../environments/environment';
import * as R from 'ramda';
import { v4 as uuidv4 } from 'uuid';
import { CookieService } from 'ngx-cookie-service';

const defaultFromCurrency = {
  symbol: 'EUR',
  value: 1,
  name: 'Euro',
};

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent implements OnInit {
  loading: Boolean = false;
  amount = 1;
  body: any;
  result: number;
  calculation = {
    amount: 0,
    fromCurrency: 'none',
    toCurrency: 'none',
    result: 0,
  };
  selectedFromCurrency: number;
  selectedToCurrency: number;

  listCurrencies: any = [];
  fromCurrencies: any = [];
  toCurrencies: any = [];

  constructor(
    private fetchingService: FetchingService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.updateCurrencies();
    this.populateCurrencies();
    this.checkCookie();
  }

  async onClick() {
    this.calculate();
    this.createLog();
  }

  calculate() {
    if (this.amount == 0) this.amount = 1;
    this.result =
      (this.amount * this.selectedToCurrency) / this.selectedFromCurrency;
    const from = R.find(R.propEq('value', this.selectedFromCurrency))(
      this.fromCurrencies
    );
    const to = R.find(R.propEq('value', this.selectedToCurrency))(
      this.toCurrencies
    );
    this.calculation = {
      amount: this.amount,
      fromCurrency: from.symbol,
      toCurrency: to.symbol,
      result: Math.round(this.result * 100000) / 100000,
    };
  }

  async updateCurrencies() {
    this.loading = true;
    try {
      await this.fetchingService.getCurrencyUpdate();
      this.loading = false;
    } catch (error) {
      console.error(
        'Error while updating currency rates, old currency rates will be used',
        error
      );
      this.loading = false;
    }
  }

  async populateCurrencies() {
    this.listCurrencies = await this.fetchingService.getCurrencyList();
    this.fromCurrencies = [defaultFromCurrency];
    this.toCurrencies = [defaultFromCurrency];
    for (let element of this.listCurrencies) {
      this.fromCurrencies.push({
        symbol: element._id,
        value: element.rate,
        name: element.name,
      });
    }
    if (
      !R.find(R.propEq('value', this.selectedFromCurrency))(this.fromCurrencies)
    )
      this.selectedFromCurrency = 1;
    for (let element of this.listCurrencies) {
      this.toCurrencies.push({
        symbol: element._id,
        value: element.rate,
        name: element.name,
      });
    }
    const defaultToCurrency = R.find(R.propEq('name', 'US dollar'))(
      this.toCurrencies
    );
    if (!R.find(R.propEq('value', this.selectedToCurrency))(this.toCurrencies))
      this.selectedToCurrency = defaultToCurrency.value;
  }

  checkCookie() {
    const cookie = this.cookieService.get('trace_id');
    if (!cookie) {
      this.cookieService.set('trace_id', uuidv4());
    }
  }

  async createLog() {
    const cookie = this.cookieService.get('trace_id');
    this.body = {
      cookieId: cookie,
      fromCurrency: this.selectedFromCurrency,
      toCurrency: this.selectedToCurrency,
      amount: this.amount,
    };
    await this.fetchingService.postLogs(this.body);
  }
}
