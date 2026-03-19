# Feed Zone

## Concept
You play as a soigneur (team helper) in a professional cycling race feed zone.
Navigate through the chaos of the race convoy to hand out musettes (feed bags)
to hungry cyclists for bonus points while avoiding collisions.

## Tech Stack
- React Three Fiber (3D rendering)
- Zustand (state management)
- Vite (build tool)
- TypeScript

## Key Mechanics
- **Movement**: Advance through the race feed zone row by row
- **Musettes**: Collect musette bags (lives) from verge rows; each acts as a checkpoint
- **Feeding**: Collide with hungry cyclists (marked `needsFeed`) to feed them for bonus points
- **Collisions**: Getting hit by non-feedable entities costs one musette; zero musettes = game over

## Row Types
| Type | Key | Contents |
|------|-----|----------|
| Verge | `verge` | Roadside objects (barriers, signs) + musette pickups |
| Convoy | `convoy` | Team cars / support vehicles moving across the road |
| Race Lane | `racelane` | Cyclists, motorbikes, commissaire vehicles |
| Grass | `grass` | Safe empty row |

## Scoring
- **Distance**: Score increases with each new row reached
- **Feeds**: Each successful feed earns bonus points (feed count x FEED_BONUS_MULTIPLIER)
- **Musettes**: Collecting musettes sets a respawn checkpoint

## Key Types (src/types/index.ts)
- `RaceEntity` — cyclist, motorbike, or commissaire in a race lane
- `RaceLaneRow`, `ConvoyRow`, `VergRow`, `GrassRow` — row data variants
- `RoadsideObject` — barrier/sign in a verge row
- `GameState` — status (`idle | running | over | paused`), musetteCount, feedCount, score

## Project Layout
- `src/components/` — React Three Fiber components (Map, Player, Scene, UI, etc.)
- `src/logic/` — Game logic (player movement, collisions, map generation)
- `src/store/` — Zustand stores (gameStore, mapStore, userStore)
- `src/sound/` — Audio helpers
- `src/utils/` — Constants and analytics
