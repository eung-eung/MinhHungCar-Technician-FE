import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import PersonPinCircleRoundedIcon from '@mui/icons-material/PersonPinCircleRounded';
import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
export interface RouteType {
    icon: JSX.Element;
    title: string;
    link: string;
    children?: RouteType[]
}

export const sidebarRoutes: RouteType[] = [
    {
        icon: < DragIndicatorIcon />,
        title: "Kiểm tra kĩ thuật",
        link: "/",
        children: [
            {
                icon: <PersonPinCircleRoundedIcon />,
                title: "Cho khách hàng",
                link: "/",
            },
            {
                icon: <HandshakeRoundedIcon />,
                title: "Cho đối tác",
                link: "/cars",
            },
        ]
    },
    {
        icon: <LogoutOutlinedIcon />,
        title: "Đăng xuất",
        link: "/logout",
    },
]