# Zenith Watch

A minimalist, visually stunning web application to monitor website uptime and performance.

[cloudflarebutton]

Zenith Watch is a visually stunning, minimalist web application designed to monitor the uptime and performance of websites. Built on Cloudflare's serverless infrastructure, it provides a clean, real-time dashboard of all monitored URLs. The core interface consists of a grid of cards, where each card represents a monitored site, displaying its current status (Up/Down), response time, and a historical performance chart. Users can seamlessly add new URLs to monitor via a dialog and remove existing ones. The application leverages a single Durable Object for persistent storage of the monitored sites, with a Hono-based API backend providing the necessary endpoints.

## Key Features

- **Real-Time Monitoring**: Get instant status updates on your websites' uptime and response time.
- **Elegant Dashboard**: A clean, responsive, and information-dense grid layout to view all your monitored sites.
- **Simple Management**: Easily add new sites to monitor or remove existing ones with a few clicks.
- **Performance Visualization**: (Coming in Phase 2) View historical performance data with beautiful, simple charts on each site card.
- **Serverless Architecture**: Built entirely on Cloudflare's high-performance serverless platform, using Workers for backend logic and Durable Objects for state.

## Technology Stack

- **Frontend**:
  - [React](https://react.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [shadcn/ui](https://ui.shadcn.com/)
  - [Zustand](https://zustand-demo.pmnd.rs/) for state management
  - [Recharts](https://recharts.org/) for data visualization
  - [Framer Motion](https://www.framer.com/motion/) for animations

- **Backend**:
  - [Hono](https://hono.dev/) on [Cloudflare Workers](https://workers.cloudflare.com/)

- **Database**:
  - [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/) for persistent, consistent storage.

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Bun](https://bun.sh/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd zenith_watch
    ```

2.  **Install dependencies:**
    This project uses Bun for package management.
    ```bash
    bun install
    ```

## Development

To start the local development server, which includes both the Vite frontend and the Wrangler dev server for the worker, run:

```bash
bun dev
```

This will open the application in your default browser, typically at `http://localhost:3000`. The frontend will hot-reload on changes, and the worker will automatically restart.

## Deployment

This project is designed for seamless deployment to Cloudflare's global network.

1.  **Log in to Wrangler:**
    If you haven't already, authenticate Wrangler with your Cloudflare account.
    ```bash
    wrangler login
    ```

2.  **Deploy the application:**
    Run the deploy script, which will build the frontend application and deploy it along with the worker to your Cloudflare account.
    ```bash
    bun deploy
    ```

Alternatively, you can deploy your own version of this project with a single click.

[cloudflarebutton]

## Project Structure

-   `src/`: Contains the frontend React application code.
    -   `components/`: Reusable UI components.
    -   `pages/`: Main application pages/views.
    -   `hooks/`: Custom React hooks.
    -   `lib/`: Utility functions.
-   `worker/`: Contains the backend Hono application and Durable Object code for the Cloudflare Worker.
-   `shared/`: TypeScript types and constants shared between the frontend and the worker.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.