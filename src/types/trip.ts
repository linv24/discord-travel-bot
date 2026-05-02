export interface LegJSON {
    flight_number?: string;
    airline?: string;
    departure_airport_code: string;
    arrival_airport_code: string;
    departure_datetime: string;
    arrival_datetime: string;
}

export interface JourneyJSON {
    confirmation: string;
    departure_datetime: string;
    arrival_datetime: string;
    legs: LegJSON[];
}

export interface TripJSON {
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    journeys: JourneyJSON[];
}
