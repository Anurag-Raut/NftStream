import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Bars3Icon, BugAntIcon, MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link
      href={href}
    
      passHref
      className={`${
        isActive ? "bg-secondary shadow-md" : ""
      } hover:bg-secondary hover:shadow-md focus:bg-secondary py-1.5 px-3 text-sm rounded-full gap-2`}
    >
      {children}
    </Link>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <div className="fixed top-0 z-10  navbar bg-base-100 min-h-0 flex-shrink-0 justify-between z-20 shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <div className=" dropdown" ref={burgerMenuRef}>
          <label
            tabIndex={0}
            className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={() => {
              setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
            }}
          >
            <Bars3Icon data-te-sidenav-toggle-ref
    data-te-target="#sidenav-2"
    aria-controls="#sidenav-2"
    aria-haspopup="true"   className="h-1/2" />
          </label>

        </div>
        <button   data-te-sidenav-toggle-ref
    data-te-target="#sidenav-2"
    aria-controls="#sidenav-2"
    aria-haspopup="true"   className="">
          Streamvault
        </button>
       
      </div>
      <div className="navbar-end flex-grow mr-4">
      <NavLink href="/publish">Stream</NavLink>
     
        <NavLink href="/upload">Upload</NavLink>
    
        <RainbowKitCustomConnectButton />
        <FaucetButton />
      </div>
    </div>
  );
};
