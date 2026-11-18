import { Fragment, type ReactNode } from "react";

import { type AdminSection, ADMIN_SECTIONS } from "@/lib/swipe";

import { AthletesScreen } from "./atletas/athletes-screen";
import { ClubsScreen } from "./clubes/clubs-screen";
import { MoreScreen } from "./mas/more-screen";
import { RankingsScreen } from "./rankings/rankings-screen";
import { SectionCarousel } from "./section-carousel";
import { TournamentsScreen } from "./torneos/tournaments-screen";

type SearchParams = PageProps<"/admin/atletas">["searchParams"];

const noSearchParams: SearchParams = Promise.resolve({});

/**
 * The five sections of the bottom bar, rendered together so that on phones a swipe shows the next
 * one following the finger (`SectionCarousel`). On larger screens only `current` shows. Only the
 * section the URL points at gets the page's query string (`?q=`, `?creado=`).
 */
export function AdminSections({
  current,
  searchParams = noSearchParams,
}: {
  current: AdminSection;
  searchParams?: SearchParams;
}) {
  const params = (section: AdminSection) =>
    section === current ? searchParams : noSearchParams;

  const screens: Record<AdminSection, ReactNode> = {
    "/admin/atletas": (
      <AthletesScreen searchParams={params("/admin/atletas")} />
    ),
    "/admin/clubes": <ClubsScreen />,
    "/admin/torneos": (
      <TournamentsScreen searchParams={params("/admin/torneos")} />
    ),
    "/admin/rankings": <RankingsScreen />,
    "/admin/mas": <MoreScreen />,
  };

  return (
    <SectionCarousel current={ADMIN_SECTIONS.indexOf(current)}>
      {ADMIN_SECTIONS.map((section) => (
        <Fragment key={section}>{screens[section]}</Fragment>
      ))}
    </SectionCarousel>
  );
}
