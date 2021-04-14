import { createFromIconfontCN } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import React from 'react';
import styles from './index.module.scss';

const classNames = require('classnames');

const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2171422_6wzmyg3qwpd.js'
});

export default IconFont;

interface IconLinkProps {
  title: string;
  placement?: TooltipPlacement;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon: string;
  style?: React.CSSProperties;
}

export const IconLink = ({
  title,
  placement = 'bottom',
  onClick,
  disabled,
  className,
  icon,
  style
}: IconLinkProps) => {
  return (
    <Tooltip placement={placement} title={title}>
      <IconFont
        className={classNames(styles.iconLink, className, {
          [styles.iconLikDisabled]: disabled
        })}
        style={{ ...style, cursor: 'pointer' }}
        type={icon}
        onClick={(e) => {
          if (!disabled && onClick) {
            onClick();
          }
        }}
      />
    </Tooltip>
  );
};
