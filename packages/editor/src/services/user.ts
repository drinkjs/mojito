import { get } from "@/common/request";

export const auth = (params: any) => get<{ token: string, name: string, id: string, avatarUrl?: string }>('/user/auth', params);

export const refresh = () => get<{ token: string, name: string, id: string, avatarUrl?: string }>('/user/refresh');