## Packages
framer-motion | Essential for all the required comic bounce, tilt, and hover animations, page transitions, and floating elements.
canvas-confetti | For a delightful "wow" moment when generating the Fest Pass ticket.
@types/canvas-confetti | Types for the confetti package.

## Notes
The application is entirely frontend-driven using `localStorage` as requested. 
No backend APIs are called for user or team data.
State management relies on custom React hooks wrapping `localStorage`.
Static assets (like floating shapes) are simulated using CSS and framer-motion shapes if actual images aren't provided.
