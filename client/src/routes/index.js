/*
 * @Author: ouruiting
 * @Date: 2020-05-26 14:17:31
 * @LastEditors: ouruiting
 * @LastEditTime: 2020-06-12 10:53:20
 * @Description: file content
 */

import React, { Suspense } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import RootLayout from 'layout/RootLayout';
import routesConf from './app.routes';
import { LoadingComponent } from '../components/Loader';

export function AppRouter () {
  return (
    <BrowserRouter>
      <RootLayout>
        <Suspense fallback={<LoadingComponent />}>
          {renderRoutes(routesConf)}
        </Suspense>
      </RootLayout>
    </BrowserRouter>
  );
}

export function renderRoutes (routes) {
  if (!routes) return null;
  return (
    <Switch>
      {routes.map((route) => {
        return route.redirect
          ? (
          <Redirect
            exact
            push
            from={route.path}
            to={route.redirect}
            key={route.path}
          />
            )
          : (
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
            );
      })}
    </Switch>
  );
}
