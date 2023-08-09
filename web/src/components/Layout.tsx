import React from 'react';
import { MainContainer } from './MainContainer';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Link from 'next/link';

export function Layout({ children }: { children: React.ReactNode }) {
  const now = new Date();
  const currentDay = format(now, 'EEEE');
  const currentDate = format(now, 'MMM d, yyyy');

  return (
    <div className="bg-slate-200">
      <div className="bg-white">
        <MainContainer>
          <div className="flex justify-between py-8 items-center">
            <Link className="space-y-1 block" href="/">
              <div>
                <h2 className="text-cyan-800 font-semibold text-xl">
                  Nyheter.sh
                </h2>
              </div>
              <div>
                <h1 className="text-gray-800">Swedish News in English</h1>
              </div>
            </Link>
            <div className="flex justify-between text-sm space-x-8">
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
          </div>
        </MainContainer>
      </div>

      {children}
    </div>
  );
}
