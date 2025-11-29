import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateOrderDto } from '../../../shared/dto/order/create-order.dto';
import { Observable } from 'rxjs';
import { Order } from '../../models/order';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiUrl = API_URL + '/order';
  private readonly http = inject(HttpClient);

  public create(createOrderDto: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, createOrderDto, {
      headers: { authorization: localStorage.getItem('token')! },
    });
  }

  public findMany(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl, {
      headers: { authorization: localStorage.getItem('token')! },
      params: Object.fromEntries(
        Object.entries({ orderBy: 'updatedAt:desc' })
          .filter(([, v]) => v != undefined && v != null && v != '')
          .map(([k, v]) => [k, String(v)]),
      ),
    });
  }
}
