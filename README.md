# PoE2 Currency Parser

TypeScript/Remix application for generating Path of Exile 2 loot filter rules based on real-time currency values.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start
```

Visit: `http://localhost:5173`

## 📦 Structure

```
├── app/
│   ├── components/
│   │   ├── currencyParser/       # Parser UI components
│   │   └── ui/                   # Shared UI components
│   ├── lib/
│   │   └── currencyParser/       # Parser logic (.server.ts)
│   ├── routes/
│   │   ├── _index.tsx           # Home page
│   │   └── currency-parser.tsx  # Main parser route
│   ├── root.tsx                 # App root
│   └── tailwind.css             # Styles
├── public/                       # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── .prettierrc                   # No semicolons, double quotes
```

## 🎯 Features

### Data Sources

**Poe.Ninja (13 categories)** - Currency, Fragments, Abyss, Uncut Gems, Lineage Support Gems, Essences, Ultimatum, Talismans, Runes, Ritual, Expedition, Delirium, Breach

**Scout (6 categories)** - Accessories, Armour, Jewels, Maps, Weapons, Sanctum

**Static (4 categories)** - Splinters, Waystones, Special Waystones, Tablets

### Capabilities

- Server-side API processing (no CORS)
- Real-time currency values
- Configurable minimum value filters
- Dynamic waystone tier selection (1-16)
- Download as `.ipd` file
- Copy to clipboard
- Dark mode support
- Responsive design

## 📊 Output Format

**Currency items:**
```
[Type] == "Exalted Orb" # [StashItem] == "true" // ExValue = 1.00
```

**Unique items:**
```
[Type] == "Ring" && [Rarity] == "Unique" # [UniqueName] == "Kaom's Ring" && [StashItem] == "true" // ExValue = 25.00
```

**Static rules:**
```
[Category] == "Waystone" && [Rarity] == "Rare" && [WaystoneTier] >= "10" # [StashItem] == "true"
```

## 🔧 Development

### Code Style

- No semicolons
- Double quotes
- 2 space indentation
- 100 character line length

```bash
# Format code
pnpm format

# Type check
pnpm typecheck

# Lint
pnpm lint
```

### Integration with eb-infra2

Copy relevant files to `eb-infra2/ts`:

```bash
cp -r app/lib/currencyParser ../eb-infra2/ts/app/lib/
cp -r app/components/currencyParser ../eb-infra2/ts/app/components/
cp app/routes/currency-parser.tsx ../eb-infra2/ts/app/routes/
```

## 🎨 Stack

- **Framework**: Remix
- **Language**: TypeScript
- **Styling**: Tailwind CSS + DaisyUI
- **Icons**: Lucide React
- **Package Manager**: pnpm
- **Runtime**: Node.js 20+

## 📄 Configuration

- **Min Value (General)**: Default 10 Ex
- **Min Value (Currency)**: Default 1 Ex
- **Waystone Tier**: 1-16
