import {
  Routes as ReactRouterRoutes,
  Route,
} from "react-router-dom";
import UpdateInfluencer from "./pages/influencers/update/[id]";
import InviteInfluencer from "./pages/influencers/Invite";
import InfluencerDashboard from "./pages/influencers/Dashboard/[id]";
import EmailSettings from "./pages/settings/EmailSettings";
import GeneralSettings from "./pages/settings/GeneralSettings";
import EditTemplate from "./pages/settings/emailSettings/Edit";

/**
 * File-based routing.
 * @desc File-based routing that uses React Router under the hood.
 * To create a new route create a new .jsx file in `/pages` with a default export.
 *
 * Some examples:
 * * `/pages/index.jsx` matches `/`
 * * `/pages/blog/[id].jsx` matches `/blog/123`
 * * `/pages/[...catchAll].jsx` matches any URL not explicitly matched
 *
 * @param {object} pages value of import.meta.globEager(). See https://vitejs.dev/guide/features.html#glob-import
 *
 * @return {Routes} `<Routes/>` from React Router, with a `<Route/>` for each file in `pages`
 */
export default function Routes({ pages }) {
  const routes = useRoutes(pages);
  const customRoutes = {};

  const routeComponents = routes.map(({ path, component: Component }) => {
    return <Route key={path} path={`${path}`} element={<Component />} />;
  });

  let Dashboard = false;
  if (routes.find(({ path }) => path === "/"))
    Dashboard = routes.find(({ path }) => path === "/").component;
  const NotFound = routes.find(({ path }) => path === "/dashboard").component;

  return (
    <>
      {/* <TopNavigationBar /> */}
      <ReactRouterRoutes>
        {routeComponents}
        {Dashboard && <Route path="/dashboard" element={<Dashboard />} />}

        <Route path="/influencer/invite" element={<InviteInfluencer />} />
        <Route path="/influencer/update/:id" element={<UpdateInfluencer />} />
        <Route
          path="/influencer/dashboard/"
          element={<InfluencerDashboard />}
        />
        <Route
          path="/settings/general-settings"
          element={<GeneralSettings />}
        />
        <Route
          path="/settings/email-notification"
          element={<EmailSettings />}
        />
        <Route
          path="/settings/email-notification/edit/"
          element={<EditTemplate />}
        />
        <Route path="*" element={<NotFound />} />
      </ReactRouterRoutes>
    </>
  );
}

function useRoutes(pages) {
  const routes = Object.keys(pages)
    .map((key) => {
      let path = key
        .replace("./pages", "")
        .replace("./proxy", "")
        .replace(/\.(t|j)sx?$/, "")
        .replace("$", ":")
        /**
         * Replace /index with /
         */
        .replace(/\/index$/i, "/")
        /**
         * Only lowercase the first letter. This allows the developer to use camelCase
         * dynamic paths while ensuring their standard routes are normalized to lowercase.
         */
        .replace(/\b[A-Z]/, (firstLetter) => firstLetter.toLowerCase())
        /**
         * Convert /[handle].jsx and /[...handle].jsx to /:handle.jsx for react-router-dom
         */
        .replace(/\[(?:[.]{3})?(\w+?)\]/g, (_match, param) => `:${param}`);

      if (path.endsWith("/") && path !== "/") {
        path = path.substring(0, path.length - 1);
      }

      if (!pages[key].default) {
        console.warn(`${key} doesn't export a default React component`);
      }

      return {
        path,
        component: pages[key].default,
      };
    })
    .filter((route) => route.component);
  return routes;
}
