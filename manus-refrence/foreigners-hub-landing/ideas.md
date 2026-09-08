# Foreigners Hub — Design Direction

## Three initial directions

### Theme Name: Wayfinding Editorial
**Very Brief Intro:** A bright, editorial take on urban wayfinding systems: crisp cobalt blocks, route lines, oversized type, and warm human photography/illustration. It should feel as dependable as a transit map and as welcoming as a local recommendation.
**Probability:** 0.07

### Theme Name: Soft Landing
**Very Brief Intro:** A calmer, hospitality-led direction with generous white space, pale blue surfaces, and tactile apartment/bike vignettes. The emotional goal is relief: a first day in a new city made easier.
**Probability:** 0.03

### Theme Name: City Desk
**Very Brief Intro:** A compact, magazine-like interface inspired by a smart city guide: strong section labels, dense but considered cards, and service-led color coding. The tone is practical, youthful, and quietly premium.
**Probability:** 0.08

## Chosen direction: Wayfinding Editorial

### Design Movement
Swiss International Typographic Style blended with contemporary urban wayfinding systems and a little editorial travel-magazine warmth.

### Core Principles
1. **Make movement legible:** route lines, numbered steps, directional arrows, and clear service labels should make the next action obvious.
2. **Use cobalt as an anchor:** #315CFF is the visual lead; green and orange are functional service signals, never competing brand colors.
3. **Pair precision with welcome:** structured type and spacing are softened by textured illustration, rounded map-like marks, and human microcopy.
4. **Prefer asymmetry over template symmetry:** split compositions and offset cards create a sense of movement without sacrificing clarity.

### Color Philosophy
The brand blue #315CFF is the city marker: confident, legible, and ownable. Off-whites (#FBFCFF, #F7F9FC) create a calm landing surface. Green #16A34A signals an available, maintained, successful rental path; orange #EA580C signals a home, a pending decision, or a warm handoff. Red #DC2626 stays reserved for critical states. Supporting colors should always defer to blue.

### Layout Paradigm
A left-anchored editorial rail with oversized headlines and a right-side visual field. Sections alternate between offset content and wide, airy surfaces. Navigation stays compact; content uses a 12-column rhythm but avoids stacking everything into identical centered cards.

### Signature Elements
- Route-line motifs that travel between sections and connect numbered steps.
- Service cards with strong category color bands and small wayfinding labels.
- A cobalt circular mark that behaves like a map pin / wheel / doorway, used as a recognizable brand accent.

### Interaction Philosophy
Every interaction should feel like a small directional cue. Buttons have a quick press response and a clear arrow. Cards lift slightly on hover, but information remains stable and readable. Navigation anchors scroll to sections; secondary actions show a concise toast rather than dead-ending.

### Animation
Use 180–260ms ease-out transitions for hover, press, and reveals. On first load, let the hero route line draw in and stagger the headline, supporting copy, and visual by 60ms. Service cards can translate 4px on hover. Avoid looping motion except for a subtle pulsing route dot. Respect `prefers-reduced-motion` and disable entrance transforms when requested.

### Typography System
Use Google Sans for all display and UI text. Headlines are bold, tight, and left aligned. Supporting copy uses regular Google Sans with generous line-height. Metadata uses small uppercase labels with 0.14em tracking. Hierarchy: display 68/0.96 on desktop, 46/1.02 on mobile; section title 44/1.04; body 17/1.55; eyebrow 11/1.2.

### Brand Essence
**Positioning:** A practical rental platform for students and newcomers who need the basics of a new city, without the usual friction.

**Personality:** Clear, generous, capable.

### Brand Voice
Headlines are direct and optimistic. CTAs are active and specific. Microcopy removes uncertainty and names the next step. Avoid corporate filler and vague promises.

Example lines:
- “Move around. Settle in.”
- “Pick your route. We’ll handle the rest.”

### Wordmark & Logo
Use a custom graphic mark that combines a route line, bicycle wheel arc, and doorway shape into one compact cobalt symbol. The wordmark is set in Google Sans with carefully spaced bold lettering beside the mark; do not use the brand name as a default unmodified text treatment.

### Signature Brand Color
**Foreigners Hub Cobalt — #315CFF**

### Implementation reminder
When in doubt, ask: **Does this choice reinforce or dilute the Wayfinding Editorial philosophy?**
