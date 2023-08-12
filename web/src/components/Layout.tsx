import React from 'react';
import { MainContainer } from './MainContainer';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Link from 'next/link';

import { XMarkIcon } from '@heroicons/react/20/solid';

function TopBanner() {
  return (
    <div className="flex items-center gap-x-6 bg-gray-900 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
      <div>
        <p className="text-sm leading-6 text-white">
          <Link href="/about">
            Are you our next Editor-in-Chief?{' '}
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </p>
      </div>
      <div className="flex flex-1 justify-end"></div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const now = new Date();
  const currentDay = format(now, 'EEEE');
  const currentDate = format(now, 'MMM d, yyyy');

  return (
    <>
      <TopBanner />
      <div className="bg-slate-200">
        <div className="bg-white">
          <MainContainer>
            <div className="flex flex-col md:flex-row space-y-4 text-center md:text-left justify-between py-8 items-center">
              <Link className="space-y-1 block" href="/">
                <div>
                  <h2 className="text-cyan-700 font-semibold text-lg">
                    Nyheter.sh
                  </h2>
                </div>
                <div>
                  <h1 className="text-gray-900 font-semibold text-2xl">
                    Swedish News in English
                  </h1>
                </div>
              </Link>
              <div className="justify-between text-sm space-x-8 hidden md:flex">
                <div className="flex items-center space-x-2">
                  <div>
                    <CalendarDaysIcon className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="font-bold">{currentDay}</div>
                    <div>{currentDate}</div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-4">
                <Link
                  href="/about"
                  className="h-8 flex items-center border rounded-md px-4 hover:bg-gray-100 transition-all duration-150 ease-out text-gray-800"
                >
                  About
                </Link>
                <a
                  href="https://nyheter.canny.io/feature-requests"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="h-8 flex items-center border rounded-md px-4 hover:bg-gray-100 transition-all duration-150 ease-out text-gray-800"
                >
                  Feedback
                </a>
              </div>
            </div>
          </MainContainer>
        </div>

        {children}
      </div>
    </>
  );
}
