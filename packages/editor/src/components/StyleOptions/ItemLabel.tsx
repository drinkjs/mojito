import React from "react";

export default function ItemLabel({
	children,
	style,
}: {
	children: any;
	style?: React.CSSProperties;
}) {
	return (
		<div style={{ fontSize:"12px", color:"rgba(255, 255, 255, 0.7)", ...style }}>
			{children}
		</div>
	);
}
