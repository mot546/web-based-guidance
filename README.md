Granby Gateway is a capstone for our school
our title is web based guidance management and scheduling system.

directories from ai
src/
├── index.js # The "Router" (checks role and calls render functions)
├── store.js # Unified localStorage getters/setters
├── styles/
│ ├── shared.css # Colors, fonts, and grid layouts
│ ├── student.css # Student-specific UI (cards, booking forms)
│ └── admin.css # Admin-specific UI (tables, sidebars)
├── components/
│ ├── studentPortal.js # Function to render Student UI
│ └── adminPortal.js # Function to render Counselor UI
└── utils/
└── date-helpers.js # Formatting using date-fns
