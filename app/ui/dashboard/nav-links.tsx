'use client';
import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePathname as usePathnameModified } from '@/app/hooks/usePathname';
import { useEffect, useState } from 'react';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Invoices',
    href: '/dashboard/invoices',
    icon: DocumentDuplicateIcon,
  },
  { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },
];

export default function NavLinks() {
  const [pathname,setPathname] = usePathnameModified(location.pathname);
  const [currentPath,setCurrentPath] = useState<string>(pathname);
  /*function setPath(){
    setCurrentPath(currentPath => location.pathname);
    console.log(currentPath);
  }*/
 useEffect(()=>{
  console.log('New path');
  console.log(pathname);
 },[pathname]);
  console.log({pathname});
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx("flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",{
              'bg-sky-100 text-blue-600':pathname === link.href
            })}
            //onClick={setPath}
            onNavigate={(e)=>{
              console.log(e);
              console.log(location.pathname);
              console.log(location);
              setPathname(link.href);
            }}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
