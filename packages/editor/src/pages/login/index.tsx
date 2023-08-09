import IconFont from "@/components/IconFont";
import { GithubOutlined } from "@ant-design/icons";
import { Button } from "antd";
import styles from "./index.module.css";

const redirect_uri = "http://localhost:5173/authorized"


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
							window.location.href = `https://github.com/login/oauth/authorize?client_id=21e685d469fb181c42ed&redirect_uri=${redirect_uri}/github&scope=user:email&state=${state}`;
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
							window.location.href = `https://gitee.com/oauth/authorize?client_id=d88e7880a49151cd39111a250398742bc4ef88bfbba0b61496ac6483576b3000&redirect_uri=${redirect_uri}/gitee&response_type=code&scope=user_info&state=${state}`;
						}}
					>
						使用Gitee登录
					</Button>
				</div>
			</section>
		</main>
	);
}
