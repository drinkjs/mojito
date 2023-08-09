import { createStore } from 'fertile';
import Components from './Components';
import Project from './Project';
import Screen from './Screen';
import User from './User';

export const {useStore: useGlobalStore, stores} = createStore({
  projectStore: new Project(),
  screenStore: new Screen(),
  componentStore: new Components(),
  userStore: new User(),
});
