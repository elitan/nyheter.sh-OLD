import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { MainContainer } from '@/components/MainContainer';
import { db } from '@/utils/db';
import { InferGetServerSidePropsType } from 'next';
import Link from 'next/link';
import { getFirstTwoSentences, renderAgo } from '@/utils/helpers';
import { AdminMenu } from '@/components/AdminMenu';

function AnalyticsEmbed() {
  return (
    <div>
      <iframe
        title="Plausible Analytics Embed"
        src="https://analytics.eliasson.me/share/nyheter.sh?auth=KnOexxTtyNJjSOQZrODAY&embed=true&theme=light"
        scrolling="no"
        frameBorder="0"
        loading="lazy"
        style={{ width: '1px', minWidth: '100%', height: '1600px' }}
      />
      <div style={{ fontSize: '14px', paddingBottom: '14px' }}>
        Stats powered by{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#4F46E5', textDecoration: 'underline' }}
          href="https://plausible.io"
        >
          Plausible Analytics
        </a>
      </div>
      <script
        async
        src="https://analytics.eliasson.me/js/embed.host.js"
      ></script>
    </div>
  );
}

export default function Page() {
  return (
    <MainContainer className="my-6">
      <AdminMenu />
      <div>
        <AnalyticsEmbed />
      </div>
    </MainContainer>
  );
}
