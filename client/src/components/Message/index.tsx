import { message } from 'antd';
// import { toast } from 'react-toastify';

// const Tips = (icon: string, msg: string) => {
//   messages.add(msg);
//   return (
//     <div style={{ fontSize: "16px", display: "flex", alignItems: "center" }}>
//       <IconFont type={icon} style={{ fontSize: 18, marginTop: "4px" }} />
//       <span style={{ marginLeft: 12 }}>{msg}</span>
//     </div>
//   );
// };

export default {
  success: (msg: string) => {
    // messages.has(msg) === false &&
    //   toast.dark(Tips("icon-success", msg), {
    //     toastId: msg,
    //     onClose: () => {
    //       messages.delete(msg);
    //     },
    //   });
    message.success({ content: msg, key: msg });
  },
  error: (msg: string) => {
    // messages.has(msg) === false &&
    //   toast.dark(Tips("icon-prompt_", msg), {
    //     toastId: msg,
    //     onClose: () => {
    //       messages.delete(msg);
    //     },
    //   });
    message.error({ content: msg, key: msg });
  },
  warning: (msg: string) => {
    // messages.has(msg) === false &&
    //   toast.dark(Tips("icon-warning", msg), {
    //     toastId: msg,
    //     onClose: () => {
    //       messages.delete(msg);
    //     },
    //   });
    message.warning({ content: msg, key: msg });
  }
};
