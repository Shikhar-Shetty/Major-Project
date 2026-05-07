# PhishAI — Project Structure

## Directory Organization

```
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # Main phishing analysis API endpoint
│   ├── page.tsx                   # Frontend UI (Next.js App Router)
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
├── lib/
│   ├── constants.ts               # System prompts, API config, MITRE types
│   ├── types.ts                   # TypeScript interfaces and types
│   ├── urlUtils.ts                # URL extraction and validation utilities
├── data/
│   └── testEmails.ts              # Test phishing and legitimate email samples
├── public/                         # Static assets
├── .env                           # Environment variables (not in repo)
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.js             # Tailwind CSS configuration
└── next.config.ts                 # Next.js configuration
```

## File Purposes

### `/app` — Application Code
- **route.ts**: POST /api/analyze handler
  - Extracts URLs from email
  - Calls VirusTotal API for URL reputation
  - Sends email + threat data to Groq LLM
  - Returns structured JSON analysis result

- **page.tsx**: Frontend dashboard
  - Email input textarea
  - Analysis button + loading state
  - Results display (verdict, confidence, reasoning, URL analysis)
  - Sample email loaders

### `/lib` — Reusable Utilities & Configuration
- **constants.ts**: All hardcoded values
  - Groq API config (endpoint, model, temperature)
  - System & user prompts for LLM
  - MITRE ATT&CK mapping
  - VirusTotal API URLs

- **types.ts**: TypeScript interfaces
  - `AnalysisResponse` — API response shape
  - `UrlAnalysisResult` — URL threat data
  - `VirusTotalResponse` — VT API result

- **urlUtils.ts**: Shared utility functions
  - `extractUrls()` — Regex-based URL extraction
  - `isValidUrl()` — URL validation

### `/data` — Datasets
- **testEmails.ts**: Test data
  - 5 phishing email samples
  - 5 legitimate email samples
  - Exported as `sampleEmails` for UI demo

## API Contract

### POST /api/analyze

**Request:**
```json
{
  "email": "Subject: ...\n\nBody: ..."
}
```

**Response:**
```json
{
  "verdict": "Phishing|Legitimate|Unknown",
  "confidence": 0-100,
  "threat_level": "Low|Medium|High|Critical",
  "mitre_attack": "T1566.001|T1566.002|T1566.003",
  "reasoning": ["string", "string"],
  "url_analysis": [
    {
      "url": "https://example.com",
      "is_malicious": boolean,
      "virus_total_score": "0/80" 
    }
  ],
  "summary": "brief explanation",
  "diagnostics": {
    "hasGroqKey": boolean,
    "hasVirusTotalKey": boolean
  }
}
```

## Environment Variables

Required in `.env`:
```
GROQ_API_KEY=sk-...
VIRUS_TOTAL_API_KEY=...
```

## Configuration & Customization

- **LLM Prompts**: Edit `lib/constants.ts` → `PHISHING_ANALYSIS_*_PROMPT`
- **Groq Model/Temperature**: Edit `lib/constants.ts` → `GROQ_CONFIG`
- **Test Data**: Add/remove samples in `data/testEmails.ts`
- **UI Theme**: Modify `app/page.tsx` classes or update `tailwind.config.js`

## Best Practices Applied

✓ Separation of concerns (utils, types, constants in `/lib`)
✓ No hardcoded values (all in `constants.ts`)
✓ Type safety (shared types in `types.ts`)
✓ Reusable functions (`urlUtils.ts`)
✓ Clean imports (`@/lib/...` aliases)
✓ Centralized test data (`data/testEmails.ts`)
