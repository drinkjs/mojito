import React from "react";

export default function ItemLabel({
	children,
	style,
}: {
	children: any;
	style?: React.CSSProperties;
}) {
	return (
		<div style={{ fontSize:"12px", ...style }}>
			{children}
		</div>
	);
}
