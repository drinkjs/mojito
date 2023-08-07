import styles from "./index.module.css"

export default function PageLoading() {
	return (
		<div
			className={styles.root}
		>
			<img src="/logo.svg" width={72} height={100} />
		</div>
	);
}
