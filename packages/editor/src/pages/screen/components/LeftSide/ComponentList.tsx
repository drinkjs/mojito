import { Col, Empty, Row, Select, Skeleton } from "antd";
import { useCallback, useEffect, useState } from "react";
import ComponentListItem from "./ComponentListItem";
import { CloseOutlined } from "@ant-design/icons";
import styles from "./index.module.css";
import { useGlobalStore } from "@/store";
import { formatPackScriptUrl } from "@/common/util";

export function ComponentList({
	componentType,
	onClose,
	visible,
}: {
	componentType?: ComponentTypeTree;
	onClose: () => void;
	visible: boolean;
}) {
	const { componentStore } = useGlobalStore();
	const { typeComponentPacks } = componentStore;
	const [loading, setLoading] = useState(false);
	const [options, setOptions] = useState<{ value: string; label: string }[]>(
		[]
	);
	const [selectedPack, setSelectedPack] = useState<
		ComponentPackInfo | undefined
	>();
	const [packScriptUrl, setPackScriptUrl] = useState<string | undefined>();

	useEffect(() => {
		if (componentType) {
			// 获取当前分类下的组件
			setLoading(true);
			componentStore.getTypeComponent(componentType.id).finally(() => {
				setLoading(false);
			});
		}
	}, [componentType, componentStore]);

	useEffect(() => {
		// 默认选中第一个
		setSelectedPack(typeComponentPacks[0]);
		// 设置下拉组件数据
		setOptions(
			typeComponentPacks.map((v) => ({
				value: v.id,
				label: `${v.name}@${v.version}`,
			}))
		);
	}, [typeComponentPacks]);

	useEffect(() => {
		if (selectedPack) {
			// 设置组件库加载脚本
			setPackScriptUrl(
				formatPackScriptUrl(selectedPack.packJson, selectedPack.name)
			);
		} else {
			setPackScriptUrl(undefined);
		}
	}, [selectedPack]);

	/**
	 * 选中组件库
	 */
	const onSelect = useCallback(
		(value: string) => {
			const selected = typeComponentPacks.find((v) => v.id === value);
			setSelectedPack(selected);
		},
		[typeComponentPacks]
	);

	return (
		<div
			className={styles.components}
			style={{ display: visible ? "flex" : "none" }}
		>
			<div className={styles.componentListTitle}>
				<div className={styles.name}>{componentType?.name}</div>
				<a className={styles.close} href={void 0} onClick={onClose}>
					<CloseOutlined />
				</a>
			</div>
			<div className={styles.componentListBox}>
				<Select
					options={options}
					onChange={onSelect}
					value={selectedPack?.id}
					style={{width:"100%", border:"none"}}
				></Select>
				<Skeleton loading={loading}>
					<Row className={styles.componentBox} gutter={[12, 12]}>
						{selectedPack && packScriptUrl ? (
							selectedPack.components.map((comp) => {
								return (
									<Col span={12} key={comp.export}>
										<ComponentListItem
											value={comp}
											scriptUrl={packScriptUrl}
											external={selectedPack.external}
											packId={selectedPack.id}
											packName={selectedPack.name}
											packVersion={selectedPack.version}
										/>
									</Col>
								);
							})
						) : (
							<div
								style={{
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									width: "100%",
									height: "100%",
								}}
							>
								<Empty
									image={Empty.PRESENTED_IMAGE_SIMPLE}
									description="暂无组件"
								/>
							</div>
						)}
					</Row>
				</Skeleton>
			</div>
		</div>
	);
}
