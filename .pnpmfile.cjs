function readPackage(pkg, context) {
  if (pkg.name && pkg.peerDependencies) {
    // https://pnpm.io/zh/how-peers-are-resolved
    pkg.peerDependencies = {}
  }

  return pkg
}

module.exports = {
  hooks: {
    readPackage,
  },
}