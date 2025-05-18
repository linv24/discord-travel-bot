# discord-travel-bot

## Features

* `upload`: Upload a screenshot of flight itinerary for processing

OCR should extract the following fields:
* general:
  * airline 
  * confirmation number 
  * number passengers? 
* departure:
  * flight date
  * flight time
  * flight number 
  * location/airport 
  * duration + layover information (maybe needs to be calculated instead?)
* arrival:
  * same as departure

Tested airlines:


## Development

parsed OCR json format:
```
{
  "confirmation": string,
  "num_passengers": number,
  "flights": [
    {
      "flight_number": string,
      "airline": string,
      "aircraft": string,
      "depart": {
        "airport": string,
        "city": string,
        "datetime": string (ISO 8601),
        "terminal": string,
        "gate": string
      },
      "arrive": {
        "airport": string,
        "city": string,
        "datetime": string (ISO 8601),
        "terminal": string,
        "gate": string
      }
    }
  ],
  "layovers": [
    {
      "airport": string,
      "duration": string
    }
  ]
}
```

### Installation/Running

1. `npm i`
1. Create a `.env` file (as a copy of `.env.example`) in the root directory and ensure that it has the following variables:
    * `DISCORD_APP_ID`: Discord app application ID
    * `DISCORD_PUBLIC_KEY`: Discord app public key
    * `DISCORD_TOKEN`: Discord bot token

To run the app: `npm run start`

### Resources

* logo inspo: https://www.behance.net/gallery/188621399/Discord-Travel-Services-Ilustrations

## References