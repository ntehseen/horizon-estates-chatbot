

# Real Estate AI Chatbot for Horizon Estates

## Overview

This project is a real estate AI chatbot designed to assist users with property details, trends, and market information. Built using Next.js and integrated with OpenAI's GPT-3.5-turbo, the chatbot provides interactive responses based on user queries.

## Features

- **Property Details**: Fetch and display information about specific properties, including prices, descriptions, and features.
- **Real Estate Trends**: Offer insights into trending properties and recent real estate events.
- **Market Information**: Provide general information about the real estate market and trends.
- **Interactive UI**: Utilize a modern user interface for smooth and engaging interactions.

## Setup

### Prerequisites

- Node.js (v16.x or later)
- npm or Yarn
- Vercel account (for deployment)
- OpenAI API key

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-repo/real-estate-chatbot.git
   cd real-estate-chatbot
   ```

2. **Install Dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set Up Environment Variables**

   Create a `.env.local` file in the root directory and add the following environment variables:

   ```env
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_API_URL=https://your-api-url.com
   ```

4. **Run the Development Server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Visit `http://localhost:3000` to view the chatbot in action.

### Deployment

To deploy the chatbot to Vercel:

1. **Push to GitHub**

   Make sure your code is committed and pushed to a GitHub repository.

2. **Import to Vercel**

   Go to the Vercel dashboard and import your GitHub repository.

3. **Configure Environment Variables**

   Set the environment variables in the Vercel dashboard to match those in your `.env.local` file.

4. **Deploy**

   Vercel will automatically build and deploy your application.

## Usage

1. **Interact with the Chatbot**

   Type your queries into the chat interface to receive responses about property details, real estate trends, and more.

2. **Purchase Properties**

   If integrated, you can interact with the chatbot to simulate purchasing properties and view transaction details.

## Customization

- **Property Details Integration**: Update the `/api/properties` endpoint to connect with your real estate data source.
- **UI Components**: Customize the components under `src/components/stocks` to match your branding and design preferences.
- **OpenAI Model**: Adjust the OpenAI model settings as needed for your use case.

## Troubleshooting

- **Invalid or Undefined Parameters**: Ensure that all environment variables are correctly set and that API endpoints are properly configured.
- **Deployment Issues**: Check Vercel logs for detailed error messages and adjust configurations accordingly.

## Contributing

Contributions are welcome! Please submit issues and pull requests via GitHub.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

