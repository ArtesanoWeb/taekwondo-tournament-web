/**
 * Screens that take the whole phone screen. On all of them the site header hides and the title
 * shows the way out instead (`TitleBar`). In the admin they also hide the bottom bar: inside a
 * tournament (and its categories) and on full-screen forms, the way out is the title's arrow or X.
 */
const adminScreensWithoutBottomNav = [
  /^\/admin\/torneos\/nuevo$/,
  /^\/admin\/torneos\/\d+$/,
  /^\/admin\/categorias\/\d+$/,
  /^\/admin\/rankings\/\d+$/,
];

const screensWithoutHeader = [
  ...adminScreensWithoutBottomNav,
  // The public site's detail pages.
  /^\/torneos\/\d+$/,
  /^\/categorias\/\d+$/,
  /^\/torneos\/\d+\/ranking$/,
];

export const hidesHeaderOnPhone = (pathname: string) =>
  screensWithoutHeader.some((route) => route.test(pathname));

export const hidesBottomNavOnPhone = (pathname: string) =>
  adminScreensWithoutBottomNav.some((route) => route.test(pathname));
