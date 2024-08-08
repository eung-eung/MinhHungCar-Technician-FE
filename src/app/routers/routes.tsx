import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

export interface RouteType {
    icon: JSX.Element;
    title: string;
    link: string;
    children?: RouteType[]
}

export const sidebarRoutes: RouteType[] = [
    {
        icon: < DragIndicatorIcon />,
        title: "Xe cần kiểm tra",
        link: "/",
    },
    {
        icon: <LogoutOutlinedIcon />,
        title: "Đăng xuất",
        link: "/logout",
    },
]