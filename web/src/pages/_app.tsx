import { Layout } from '@/components/Layout';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <DefaultSeo
        title="Nyheter.sh: Swedish news in English."
        description="Explore Nyheter.sh for the latest Swedish news in English. Stay updated on politics, sports, entertainment, and more from Sweden's diverse regions. Translate the world of Swedish events and culture with daily updates and insights, all available at your fingertips at Nyheter.sh. Join us now for a global perspective on local stories."
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
