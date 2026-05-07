# PhishAI — Phase-1 Prototype

AI-powered phishing email detection system using Next.js, TypeScript, Groq LLM, and VirusTotal API.

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set environment variables in `.env`:**
```env
GROQ_API_KEY=your_groq_api_key
VIRUS_TOTAL_API_KEY=your_virustotal_api_key
```

3. **Run development server:**
```bash
npm run dev
```

4. **Open browser:**
Navigate to `http://localhost:3000`

## Project Structure

See [lib/README.md](lib/README.md) for detailed folder organization and file purposes.

```
├── app/                  # Next.js App Router
│   ├── api/analyze/     # Phishing analysis API endpoint
│   ├── page.tsx         # Frontend dashboard UI
│   └── globals.css      # Styles
├── lib/                 # Reusable utilities & configuration
│   ├── constants.ts     # Prompts, API config, MITRE types
│   ├── types.ts         # TypeScript interfaces
│   └── urlUtils.ts      # URL extraction & validation
├── data/                # Test datasets
│   └── testEmails.ts    # Sample phishing/legitimate emails
└── public/              # Static assets
```

## Core Features

- **Phishing Detection**: LLM-based email analysis with reasoning
- **URL Threat Checking**: VirusTotal integration for malicious URL detection
- **MITRE ATT&CK Mapping**: Classification of attack techniques
- **Confidence Scoring**: 0-100 confidence metric
- **Explainable AI**: Detailed reasoning for each verdict

## API Endpoint

**POST** `/api/analyze`

### Request
```json
{
  "email": "Subject: Urgent...\n\nBody content..."
}
```

### Response
```json
{
  "verdict": "Phishing|Legitimate|Unknown",
  "confidence": 85,
  "threat_level": "High",
  "mitre_attack": "T1566.002",
  "reasoning": ["..."],
  "url_analysis": [{"url": "...", "is_malicious": true}],
  "summary": "..."
}
```

## Configuration

All configuration centralized in `lib/constants.ts`:
- Groq endpoint, model, temperature
- System & user prompts for LLM
- MITRE ATT&CK type mappings
- VirusTotal API URLs

## Tech Stack

- **Frontend**: Next.js 16+ (App Router), React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **LLM**: Groq API (Llama 3.3 70B)
- **Security**: VirusTotal API
- **Styling**: TailwindCSS v4

## Notes

- No database required (stateless)
- No authentication layer
- Phase-1 prototype for academic/demo purposes
- Adjust Groq/VirusTotal endpoints in `lib/constants.ts` if needed
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
