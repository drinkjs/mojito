import { useState } from "react";
import ProjectList from "./components/ProjectList";
import ScreenList from "./components/ScreenList";
import styles from "./styles/index.module.css";

export default function Project() {
	const [selectedProject, setSelectedProject] = useState<ProjectInfo | undefined>()
	return (
		<div className={styles.container}>
			<aside className={styles.projectListBox}>
				<div className={styles.logoBox}>
					<img src="/logo.svg" width={72} height={100} />
				</div>
				<div className={styles.gitBox}>
					<a href="https://gitee.com/drinkjs/mojito">
						<img src="/gitee.svg" width="89" height="28" />
					</a>
					<a
						href="https://github.com/drinkjs/mojito"
						style={{ marginLeft: "12px" }}
					>
						<img src="/github.png" width="28" height="28" />
					</a>
				</div>
				<ProjectList onSelect={setSelectedProject} />
			</aside>
			<main className={styles.screenListBox}>
				<ScreenList project={selectedProject} />
			</main>
		</div>
	);
}
