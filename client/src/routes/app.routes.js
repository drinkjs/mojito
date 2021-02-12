/*
 * @Author: ouruiting
 * @Date: 2020-05-26 14:17:31
 * @LastEditors: ouruiting
 * @LastEditTime: 2020-05-28 13:48:35
 * @Description: file content
 */
import RootLayout from 'layout/RootLayout';

const routes = [
  {
    path: '/',
    component: RootLayout,
    routes: [
      {
        path: '/',
        redirect: '/editor/project',
        routes: [
          {
            path: '/editor/project',
            component: 'editor/Project'
          },
          {
            path: '/editor/screen/:id',
            component: 'editor/Screen'
          }
        ]
      },
      {
        path: '/screen/:id',
        exact: true,
        component: 'preview'
      }
    ]
  }
];

export default routes;
