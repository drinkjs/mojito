import IconFont from "@/components/IconFont";
import { GithubOutlined } from "@ant-design/icons";
import { Button } from "antd";
import styles from "./index.module.css";

const { VITE_GITHUB_CLIENT_ID, VITE_AUTH_URL, VITE_GITEE_CLIENT_ID } =
	import.meta.env;

export default function Login() {
	return (
		<main className={styles.root}>
			<div className={styles.logo}>
				<img src="/logo.svg" width={72} height={100} />
			</div>
			<section>
				<div className={styles.text}>登 录</div>
				<div className={styles.btnBox}>
					<Button
						icon={<GithubOutlined />}
						type="primary"
						size="large"
						block
						onClick={() => {
							const state = Date.now().toString(26);
							localStorage.setItem("authState", state);
							window.location.href = `https://github.com/login/oauth/authorize?client_id=${VITE_GITHUB_CLIENT_ID}&redirect_uri=${VITE_AUTH_URL}/github&scope=user:email&state=${state}`;
						}}
					>
						使用Github登录
					</Button>
				</div>
				<div className={styles.btnBox}>
					<Button
						icon={<IconFont type="icon-gitee" />}
						type="primary"
						danger
						// ghost
						size="large"
						block
						onClick={() => {
							const state = Date.now().toString(26);
							localStorage.setItem("authState", state);
							window.location.href = `https://gitee.com/oauth/authorize?client_id=${VITE_GITEE_CLIENT_ID}&redirect_uri=${VITE_AUTH_URL}/gitee&response_type=code&scope=user_info&state=${state}`;
						}}
					>
						使用Gitee登录
					</Button>
				</div>
			</section>
		</main>
	);
}
