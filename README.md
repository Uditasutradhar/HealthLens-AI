
# HealthLens AI
### AI-Assisted Medical Report Understanding System

HealthLens AI is a web application prototype that uses
generative AI to help users understand medical report
content through structured, user-friendly explanations
and makes diagnostic predictions.

## Features

- Medical-report upload interface
- AI-assisted report interpretation
- Structured responses with headings and tables
- Follow-up questions through a conversational interface
- User-friendly interface for exploring report information

Note: Include only features that work in the current build.

## Technology Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Google Gemini API
- React Markdown

## How It Works

1. The user provides a supported medical report.
2. The application prepares the report content.
3. The Gemini API generates an explanation.
4. The application displays the response.
5. The user can ask follow-up questions, if supported.

## Getting Started

### Prerequisites

- Node.js and npm
- A Gemini API key

### Installation

1. Clone this repository:

   git clone YOUR_GITHUB_REPOSITORY_URL

2. Open the project folder:

   cd YOUR_PROJECT_FOLDER

3. Install dependencies:

   npm install

4. Configure the required environment variables using
   the variable names expected by the application.

5. Start the development server:

   npm run dev

## Security and Medical Disclaimer

Never commit API keys or sensitive medical reports.
AI-generated explanations may be inaccurate and are
not a substitute for professional medical advice,
diagnosis, or treatment.

## Future Improvements

- Secure server-side API integration
- Improved document extraction and validation
- Multilingual report explanations
- Systematic testing with de-identified reports
