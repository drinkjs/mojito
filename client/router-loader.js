// 解释routes下的路由，生成懒加载的路由规则
module.exports = function (content, map, meta) {
  const regx = /component:\s*["']+[\d\w\\/]+["']+/g;
  let newContent = content.replace(regx, function (match) {
    const comp = match.replace(/(\s|component:|["'])/g, '');
    return `component: lazyLoader(() => import("pages/${comp}"))`;
  });
  newContent = `import {lazyLoader} from "components/Loader";\n ${newContent}`;
  return newContent;
};
