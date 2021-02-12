/*
 * @Author: ouruiting
 * @Date: 2020-05-26 14:17:31
 * @LastEditors: ouruiting
 * @LastEditTime: 2020-06-12 10:53:20
 * @Description: file content
 */

import React, { Suspense } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { matchPath, Router } from 'react-router';
import routesConf from './app.routes';
import { LoadingComponent } from '../components/Loader';

export default function RouterConfig () {
  const pages = formatRoutes(routesConf);
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingComponent />}>{renderRoutes(pages)}</Suspense>
    </BrowserRouter>
  );
}

export function renderRoutes (routes) {
  if (!routes) return null;
  return (
    <>
      {routes.map((route, index) => {
        const key = `router${index}`;
        if (route.redirect) {
          return (
            <Switch key={key}>
              <Redirect exact push from={route.path} to={route.redirect} />
              {renderRoutes(route.routes)}
            </Switch>
          );
        }
        return (
          <Switch key={key}>
            <Route
              path={route.path}
              key={route.path}
              exact={!!route.exact}
              render={(props) =>
                route.component
                  ? (
                  <route.component {...props} route={route} />
                    )
                  : (
                      renderRoutes(route.routes)
                    )
              }
            />
          </Switch>
        );
      })}
    </>
  );
}

export function matchRoutes (
  routes,
  pathname,
  /* not public API */ branch = []
) {
  routes.some((route) => {
    const match = route.path
      ? matchPath(pathname, route)
      : branch.length
        ? branch[branch.length - 1].match // use parent match
        : Router.computeRootMatch(pathname); // use default "root" match

    if (match) {
      branch.push({ route, match });

      if (route.routes) {
        matchRoutes(route.routes, pathname, branch);
      }
    }

    return match;
  });

  return branch;
}

function formatRoutes (routes) {
  const routeArr = [];
  if (routes) {
    routes.forEach((v) => {
      routeArr.push({
        ...v,
        routes: formatRoutes(v.routes)
      });
    });
  }
  return routeArr;
}
