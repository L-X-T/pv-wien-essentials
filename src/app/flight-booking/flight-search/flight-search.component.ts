import { Component, OnDestroy } from '@angular/core';

import { Flight } from '../../entities/flight';
import { FlightService } from '../shared/services/flight.service';

import { Observable, Observer, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { pattern } from '../../shared/global';

import { Router } from '@angular/router';

@Component({
  selector: 'flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css']
})
export class FlightSearchComponent implements OnDestroy {
  from = 'Graz';
  to = 'Hamburg';

  flights: Flight[] = [];
  flights$: Observable<Flight[]>;
  flightsSubscription: Subscription;

  selectedFlight: Flight;
  flightToEdit: Flight;
  pattern = pattern;

  message: string;

  onDestroySubject = new Subject<void>();

  basket: Record<number, boolean> = {
    3: true,
    5: true
  };

  constructor(private flightService: FlightService, private router: Router) {}

  search(): void {
    // 1. my observable
    this.flights$ = this.flightService.find(this.from, this.to);

    // 2. my observer
    const flightsObserver: Observer<Flight[]> = {
      next: (flights) => (this.flights = flights),
      error: (errResp) => console.error('Error loading flights', errResp),
      complete: () => console.log('complete')
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

  /*save(): void {
    this.flightService.save(this.flightToEdit).subscribe({
      next: (flight) => {
        this.flightToEdit = flight;
        this.message = 'Success!';
      },
      error: (errResponse) => {
        console.error('Error', errResponse);
        this.message = 'Error!';
      }
    });
  }*/

  updateFlight(updatedFlight: Flight): void {
    // console.warn('FlightSearchComponent - updateFlight()');
    // console.log(updatedFlight);

    this.flights = this.flights.map((flight) => (flight.id === updatedFlight.id ? updatedFlight : flight));
  }

  onEdit(id: number): void {
    this.router.navigate(['/flight-booking', 'flight-edit', id, { showDetails: true }]);
  }

  delayFirstFlight(): void {
    if (this.flights.length > 0) {
      const ONE_MINUTE = 1000 * 60;
      const firstFlight = this.flights[0];
      const date = new Date(firstFlight.date);
      const newDate = new Date(date.getTime() + 15 * ONE_MINUTE);

      // mutable update
      firstFlight.date = newDate.toISOString();

      // immutable update
      // this.flights[0] = { ...firstFlight, date: newDate.toISOString() };
    }
  }
}
