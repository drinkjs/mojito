import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { useParams } from 'react-router-dom';
import { Skeleton } from 'antd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ScreenStore } from 'types';
import ContentLayout from '../ContentLayout';
import ComponentSide from '../components/ComponentSide';
import AttributeSide from '../components/AttributeSide';
import Playground from '../components/Playground';
import DragLayer from './DragLayer';

const { useEffect } = React;

interface Props {
  screenStore?: ScreenStore;
}

export default inject('screenStore')(
  observer((props: Props) => {
    const { screenStore } = props;
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
      screenStore!.getDetail(id);
    }, []);

    return (
      <ContentLayout
        title={screenStore!.screenInfo ? screenStore!.screenInfo.name : ''}
        showBack
        backLink="/editor/project"
      >
        <DndProvider backend={HTML5Backend}>
          <ComponentSide />
          <DragLayer />
          <Skeleton loading={screenStore!.getDetailLoading}>
            <Playground />
          </Skeleton>
        </DndProvider>
        <AttributeSide />
      </ContentLayout>
    );
  })
);
