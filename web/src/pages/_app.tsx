import { Layout } from '@/components/Layout';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';
import PlausibleProvider from 'next-plausible';
import { type AppType } from 'next/app';
import { ClerkProvider } from '@clerk/nextjs';
import { api } from '@/utils/api';
import 'react-toastify/dist/ReactToastify.min.css';
import { ToastContainer } from 'react-toastify';

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <PlausibleProvider
      domain="nyheter.sh"
      customDomain="https://analytics.eliasson.me"
      selfHosted={true}
      enabled={true}
    >
      <ClerkProvider
        appearance={{
          elements: {
            footer: 'hidden',
          },
        }}
      >
        <Layout>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <DefaultSeo
            title="Swedish news in English - Nyheter.sh"
            description="Explore Nyheter.sh for the latest Swedish news in English. Stay updated on politics, sports, entertainment, and more from Sweden's diverse regions. Translate the world of Swedish events and culture with daily updates and insights, all available at your fingertips at Nyheter.sh. Join us now for a global perspective on local stories."
            openGraph={{
              images: [
                {
                  url: 'https://nyheter.sh/og.png',
                  alt: 'Nyheter.sh: Swedish news in English.',
                  type: 'image/png',
                },
              ],
              siteName: 'Nyheter.sh',
            }}
            twitter={{
              handle: '@elitasson',
              site: '@nyheter.sh',
              cardType: 'summary_large_image',
            }}
          />
          <Component {...pageProps} />
        </Layout>
      </ClerkProvider>
    </PlausibleProvider>
  );
};

export default api.withTRPC(MyApp);
