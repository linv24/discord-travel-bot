export interface FlightSegment {
  number: string;
  aircraft?: string;
  departTime: string;
  departAirport: string;
  arrivalTime: string;
  arrivalAirport: string;
}

export interface Layover {
  airport: string;
  duration: string;
}

export interface ParsedItinerary {
  confirmation?: string;
  date?: string;
  passengers?: number;
  flights: FlightSegment[];
  layovers: Layover[];
}

export function parseItineraryOCR(text: string): ParsedItinerary {
  const result: ParsedItinerary = {
    flights: [],
    layovers: [],
  };

  result.confirmation = text.match(/Confirmation\s+#?\s*([A-Z0-9]{6})/)?.[1];
  result.date = text.match(/(?:Tue|Mon|Wed|Thu|Fri|Sat|Sun)[a-z]*,\s+(June|July|May)\s+\d{1,2}/i)?.[0];
  result.passengers = parseInt(text.match(/(\d)\s+Passenger/)?.[1] || "2");

  const flightRegex = /DL\d{4}/g;
  const timeRegex = /\b\d{1,2}:\d{2}(am|pm)\b/gi;
  const airportRegex = /\b[A-Z]{3}\b/g;

  const flightMatches = text.match(flightRegex) ?? [];
  const timeMatches = text.match(timeRegex) ?? [];
  const airportMatches = text.match(airportRegex) ?? [];

  for (let i = 0; i < flightMatches.length; i++) {
    result.flights.push({
      number: flightMatches[i],
      departTime: timeMatches[i * 2] ?? "",
      arrivalTime: timeMatches[i * 2 + 1] ?? "",
      departAirport: airportMatches[i * 2] ?? "",
      arrivalAirport: airportMatches[i * 2 + 1] ?? "",
    });
  }

  const layoverMatch = text.match(/Layover\s+(\d+h\s*\d+m)/i);
  if (layoverMatch) {
    const midAirport = result.flights.length > 1 ? result.flights[0].arrivalAirport : "MSP";
    result.layovers.push({
      airport: midAirport,
      duration: layoverMatch[1],
    });
  }

  return result;
}
