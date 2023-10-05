import React from 'react';
import { MainContainer } from './MainContainer';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Link from 'next/link';
import { Footer } from './Footer';
import { UserButton, useAuth } from '@clerk/nextjs';

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

  const { isSignedIn } = useAuth();

  return (
    <>
      {/* <TopBanner /> */}
      <div className="bg-slate-200">
        <div className="bg-white top-0 sticky">
          <MainContainer>
            <div className="flex flex-col md:flex-row space-y-4 text-left justify-between py-4 items-center">
              <Link className="space-x-4 flex items-center" href="/">
                <div>
                  <img src="/logo.png" className="h-10 w-10 " alt="Logo" />
                </div>
                <div>
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
                {isSignedIn && (
                  <Link
                    href="/admin"
                    className="h-8 flex items-center border rounded-md px-4 hover:bg-gray-100 transition-all duration-150 ease-out text-gray-800"
                  >
                    Admin
                  </Link>
                )}
                <UserButton />
              </div>
            </div>
          </MainContainer>
        </div>
        {children}
        <Footer />
      </div>
    </>
  );
}
