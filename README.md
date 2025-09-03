# EthXpose Frontend

A Next.js web application for Ethereum wallet fraud detection using machine learning algorithms and transaction graph analysis.

## Features

- **Wallet Analysis**: Enter any Ethereum wallet address to analyze its fraud probability
- **Interactive Graph**: Visualize transaction relationships using D3.js force-directed graphs
- **Real-time Classification**: Get instant fraud probability scores using machine learning models
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: D3.js
- **HTTP Client**: Axios
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ethxpose-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Deployment on Vercel

This application is configured for easy deployment on Vercel:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Connect your repository to Vercel
3. Vercel will automatically detect the Next.js framework and deploy
4. Your app will be available at `https://your-app-name.vercel.app`

### Manual Deployment

You can also deploy manually using the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## API Integration

The application connects to the EthXpose API at `https://ethxpose.onrender.com` for wallet classification and fraud detection.

## Project Structure

```
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout component
│   └── page.tsx         # Main application page
├── package.json         # Dependencies and scripts
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── vercel.json          # Vercel deployment configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
