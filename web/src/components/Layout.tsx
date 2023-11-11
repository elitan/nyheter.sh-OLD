import React from 'react';
import { MainContainer } from './MainContainer';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Link from 'next/link';
import { Footer } from './Footer';
import { UserButton, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { languages } from '@/utils/helpers';

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
  const router = useRouter();

  const lang = (router.query.lang as string) ?? 'en';

  const { isSignedIn } = useAuth();

  const dir = lang && languages[lang].rtl ? 'rtl' : 'ltr';

  return (
    <>
      {/* <TopBanner /> */}
      <div className="bg-slate-200" dir={dir}>
        <div className="bg-white top-0 sticky">
          <MainContainer>
            <div className="relative flex flex-col md:flex-row text-left justify-between py-2 items-center">
              <Link className="space-x-4 flex items-center" href={`/${lang}`}>
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
                    <h1 className="text-gray-900 font-semibold text-xl">
                      {languages[lang].slogan}
                    </h1>
                  </div>
                </div>
              </Link>
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
              <div className="flex items-center space-x-2">
                <div>
                  <select
                    id="location"
                    name="location"
                    className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    defaultValue="Canada"
                    onChange={(e) => {
                      // TODO: Get the articles slug of the given language and redirect there
                      // const currentPath = router.asPath;
                      // if (router.asPath.startsWith(`/${lang}`)) {
                      //   return router.push(
                      //     currentPath.replace(`/${lang}`, `/${e.target.value}`),
                      //   );
                      // }

                      router.push(`/${e.target.value}`);
                    }}
                  >
                    {Object.keys(languages).map((key) => {
                      const language = languages[key];
                      return (
                        <option key={key} value={key}>
                          {language.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* <div>
                  <CalendarDaysIcon className="h-7 w-7" />
                </div>
                <div>
                  <div className="font-bold">{currentDay}</div>
                  <div>{currentDate}</div>
                </div> */}
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
