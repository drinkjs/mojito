import { createFromIconfontCN } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import React from 'react';
import styles from './index.module.css';
import classNames from'classnames';

const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/c/font_2171422_b8ebi695gzn.js'
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
        onClick={() => {
          if (!disabled && onClick) {
            onClick();
          }
        }}
      />
    </Tooltip>
  );
};
