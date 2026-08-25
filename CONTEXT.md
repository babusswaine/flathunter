# Flat Hunter

A personal tool for one person to keep track of rental and short-term-stay places they're considering, across whichever city or country they happen to be looking in.

## Language

**Listing**:
One place someone could stay — a rental unit or a short-term stay, captured from wherever it was found online.
_Avoid_: Property, Unit, Flat, Ad

**Capture**:
The act of turning a listing URL into a saved Listing — reading the page and filling in its details.
_Avoid_: Scrape, Import, Add

**Platform**:
The site or service a Listing came from (e.g. DotProperty, Rentpad, Airbnb, Idealista).
_Avoid_: Source, Site

**City**:
The top-level place a Listing is grouped under when browsing. Always the city itself, never the country — country is recorded but isn't how listings are browsed.
_Avoid_: Location, Region

**Neighborhood**:
The specific named area within a City a Listing sits in (e.g. "Legazpi Village" within Makati) — always more specific than the City, never just repeating it.
_Avoid_: District, Area, Barrio (use the English term consistently even when the source page uses a local one)

**Status**:
Where a Listing stands in the owner's own process of deciding on it: New, Interested, Contacted, Toured, Rejected, or Extraction failed.
_Avoid_: Stage, State

**Extraction failed**:
A Status meaning the source page couldn't be read when the Listing was captured. The Listing is kept (not dropped) so it can be tried again later.
_Avoid_: Error, Failed (on its own — always in the specific sense of a failed capture, not any other kind of failure)

**Favorite**:
A personal bookmark flag on a Listing, separate from its Status.

**Amenity**:
A feature the place itself has (e.g. a pool, wifi, a kitchen), drawn from a fixed, shared list so the same feature is always described the same way across every Platform.
_Avoid_: Feature, Facility

**Rule**:
A restriction on the place (e.g. whether pets are allowed) — kept separate from Amenity, since a restriction isn't a feature.
_Avoid_: Restriction, Policy (as a Listing-level term — "Rule" is the one used consistently)

**Stay length**:
Whether a Listing is priced by the month (a rental) or by the night (a short-term stay like Airbnb). Both are Listings; this only affects how the price reads.
_Avoid_: Booking type, Rental type
