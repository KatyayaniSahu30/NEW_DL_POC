//The purpose of this file is to set up the integration of trpc with a Next.js application.
//By using the withTRPC HOC, you are enhancing your main App component to handle tRPC-related functionality seamlessly.


import { AppProps } from 'next/app';
import { withTRPC } from '@trpc/next';
import { trpc } from "../../src/utils";
import '@/styles/globals.css'
import { ToastContainer } from 'react-toastify'; // Import ToastContainer

// Define the function App as a React component with correct signature
  const App = ({ Component, router, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
}

// Wrap your App component with withTRPC and specify the router type
export default trpc.withTRPC(App);