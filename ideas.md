# LunarMatch Design Direction

## Three candidate directions

### 1. Orbital Instrument Panel
A dark scientific workstation with restrained cyan, lunar-surface blue, and amber evidence accents. It treats correspondence as a mission-control instrument rather than a consumer dashboard.

Probability: 0.07

### 2. Editorial Planetary Atlas
A bright research-atlas aesthetic using warm paper, graphite, mineral blue, and field-note annotations. It makes the project feel like a published scientific field guide.

Probability: 0.03

### 3. Signal / Terrain Split
A high-contrast split-screen system that pairs photographic terrain with measured signal traces and sparse technical typography. It emphasizes the difference between appearance and evidence.

Probability: 0.06

## Selected approach: Orbital Instrument Panel

### Design Movement
Contemporary mission-control interface design blended with scientific field instrumentation and archival aerospace graphics.

### Core Principles
1. Evidence before decoration: every visual accent must explain a stage, metric, or confidence decision.
2. Split-view thinking: source and target imagery stay visually comparable, with overlays used only for correspondence evidence.
3. Dense but legible: technical detail is grouped into short readouts, not crowded into generic cards.
4. Honest uncertainty: accepted, rejected, and unverified states remain visibly distinct.

### Color Philosophy
The base is a deep orbital navy that reduces glare and lets grayscale lunar imagery carry the visual authority. Electric cyan marks active correspondence and interface affordances, while mineral amber marks warnings, metadata, and uncertainty. A muted mint marks verified geometry. These accents are functional, not ornamental.

### Layout Paradigm
Use a top-level mission header, a large two-column comparison stage, and a right-side evidence rail. Controls remain close to the image pair. The page should feel like a single instrument console with clear reading order: identify the pair, inspect the overlay, then audit the metrics.

### Signature Elements
1. A thin orbital coordinate grid used sparingly behind major sections.
2. Cyan correspondence lines and numbered keypoints over imagery.
3. Compact monospaced readouts with explicit units and test-condition labels.

### Interaction Philosophy
Interactions should reveal evidence, not distract. Selecting a match highlights the same point in both images and exposes its descriptor distance, residual, and inlier status. Toggling rejected matches should make uncertainty inspectable rather than hidden.

### Animation
Use quick opacity and transform transitions under 220ms for state changes. Avoid continuous motion. When a run completes, reveal the verified-result rail in a restrained sequence: status, inliers, reprojection error, then confidence. Respect reduced-motion preferences.

### Typography System
Use Space Grotesk for display headings and IBM Plex Mono for labels, metrics, coordinates, and evidence. Headings use tight, confident weight; body copy stays short and readable. Numeric values always include units or a definition nearby.

### Brand Essence
LunarMatch is an explainable lunar correspondence instrument for researchers, mission planners, and technical reviewers who need to know not only whether two observations align, but why.

Personality: precise, observant, accountable.

### Brand Voice
Headlines are direct and evidence-led. CTAs use verbs that describe an action. Microcopy explains limits without apologizing.

Example lines:
- “Compare terrain. Audit the evidence.”
- “Run correspondence”
- “A match is only useful when its geometry agrees.”

### Wordmark & Logo
Use a compact circular mark built from two offset crater rings connected by three correspondence points. The SEMICODERS wordmark stays separate as the team identity; LunarMatch is the product name.

### Signature Brand Color
Signal cyan: #55E6E0.

## File-level reminder
Every edited page/component should preserve the Orbital Instrument Panel direction: deep orbital navy, grayscale lunar imagery, cyan correspondence evidence, amber uncertainty, mint verification, Space Grotesk + IBM Plex Mono, and concise technical copy.

## Style Decisions

- Verification color rule: mint is reserved for confirmed geometry and accepted outcomes; amber is reserved for uncertainty and test-condition warnings; cyan is reserved for active correspondence and controls; red is reserved for rejected candidates.
- Layout rule: the primary page reads as one console workflow—pair identity first, source/target comparison second, evidence audit third.
- Brand rule: the LunarMatch mark uses the two-offset-crater-rings plus three correspondence-points motif, while SEMICODERS remains a separate team identity.
- The orbital coordinate grid is used as a recognizable structural motif behind the hero and evidence areas, not as decorative noise.
