import { Layout } from '@/components/Layout';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';
import { GoogleAnalytics } from 'nextjs-google-analytics';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <GoogleAnalytics trackPageViews />
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
  );
}
