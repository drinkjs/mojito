/*
 * @Author: ouruiting
 * @Date: 2020-05-26 14:17:31
 * @LastEditors: ouruiting
 * @LastEditTime: 2020-05-28 13:48:35
 * @Description: file content
 */

const routes = [
  {
    path: '/',
    exact: true,
    component: 'editor/Project'
  },
  {
    path: '/editor/project',
    component: 'editor/Project'
  },
  {
    path: '/editor/screen/:id',
    exact: true,
    component: 'editor/Screen'
  },
  {
    path: '/view/:projectName/:screenName',
    exact: true,
    component: 'View'
  },
  {
    path: '/test',
    exact: true,
    component: 'test'
  }
];

export default routes;
