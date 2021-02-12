import React from 'react'
import { inject, MobXProviderContext, observer } from 'mobx-react'
import Component from './component'
import Project from './project'
import Screen from './screen'

export const stores = {
  componentStore: new Component(),
  projectStore: new Project(),
  screenStore: new Screen()
}

export function useStores () {
  return React.useContext(MobXProviderContext)
}

export function StoreComp<T = any> (
  fc: (props: T) => any,
  ...storeArr: string[]
) {
  return inject(...storeArr)(observer(fc))
}
