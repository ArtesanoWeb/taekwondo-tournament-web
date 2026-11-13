/**
 * Screens that take the whole phone screen. On all of them the site header hides and the title
 * shows the way out instead (`TitleBar`); the admin's full-screen forms also hide the bottom bar,
 * so the only ways out are closing or submitting the form.
 */
const fullscreenForms = [/^\/admin\/torneos\/nuevo$/];

const screensWithoutHeader = [
  ...fullscreenForms,
  /^\/admin\/torneos\/\d+$/,
  /^\/admin\/categorias\/\d+$/,
  // The public site's detail pages.
  /^\/torneos\/\d+$/,
  /^\/categorias\/\d+$/,
];

export const hidesHeaderOnPhone = (pathname: string) =>
  screensWithoutHeader.some((route) => route.test(pathname));

export const hidesBottomNavOnPhone = (pathname: string) =>
  fullscreenForms.some((route) => route.test(pathname));
