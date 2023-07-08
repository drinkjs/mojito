import { createStore } from 'fertile';
// import Component from './component';
import Project from './Project';
import Screen from './Screen';

export const {useStore, stores} = createStore({
  // componentStore: new Component(),
  projectStore: new Project(),
  screenStore: new Screen()
});
