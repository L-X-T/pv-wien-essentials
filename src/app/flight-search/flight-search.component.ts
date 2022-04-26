import { Component, OnDestroy, OnInit } from '@angular/core';

import { Flight } from '../entities/flight';
import { FlightService } from './flight.service';
import { Observable, Observer, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css']
})
export class FlightSearchComponent implements OnInit, OnDestroy {
  from = 'Graz';
  to = 'Hamburg';

  flights: Flight[] = [];
  flights$: Observable<Flight[]>;
  flightsSubscription: Subscription;

  selectedFlight: Flight;

  message: string;

  onDestroySubject = new Subject<void>();

  constructor(private flightService: FlightService) {}

  ngOnInit(): void {}

  search(): void {
    // 1. my observable
    this.flights$ = this.flightService.find(this.from, this.to);

    // 2. my observer
    const flightsObserver: Observer<Flight[]> = {
      next: (flights) => (this.flights = flights),
      error: (errResp) => console.error('Error loading flights', errResp),
      complete: () => console.debug('complete')
    };

    // 3. my subscription
    // this.flightsSubscription = this.flights$.subscribe(flightsObserver);
    this.flights$.pipe(takeUntil(this.onDestroySubject)).subscribe(flightsObserver);
  }

  ngOnDestroy(): void {
    // 4. my unsubscribe
    this.flightsSubscription?.unsubscribe();

    // const my$ = this.onDestroySubject.asObservable();
    this.onDestroySubject.next();
    this.onDestroySubject.complete();
  }

  select(f: Flight): void {
    this.selectedFlight = f;
  }

  save(): void {
    this.flightService.save(this.selectedFlight).subscribe({
      next: (flight) => {
        this.selectedFlight = flight;
        this.message = 'Success!';
      },
      error: (errResponse) => {
        console.error('Error', errResponse);
        this.message = 'Error!';
      }
    });
  }
}
