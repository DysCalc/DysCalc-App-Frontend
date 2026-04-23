import {
    Cog8ToothIcon,
    HomeIcon,
    UserIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon
} from "@heroicons/react/24/outline";

export interface NavLinks {
    label: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}
export interface NavGroup {
    title: string;
    links: NavLinks[];
}

const SHARED_NAVIGATIONS: NavLinks[] = []

export const STUDENT_NAVIGATIONS: NavGroup[] = [
    {
        title: "Main",
        links: [
            {
                label: "Dashboard",
                href: "/student/dashboard",
                icon: HomeIcon,
            },
        ],
    },
    {
        title: "Settings",
        links: [
            {
                label: "Settings",
                href: "/student/settings",
                icon: Cog8ToothIcon,
            },
            ...SHARED_NAVIGATIONS,
        ],
    },
];

export const EDUCATOR_NAVIGATIONS: NavGroup[] = [
    {
        title: "Main",
        links: [
            {
                label: "Dashboard",
                href: "/educator/dashboard",
                icon: HomeIcon,
            },
            {
                label: "Classroom",
                href: "/educator/classroom",
                icon: UserGroupIcon,
            },
            {
                label: "Assessments",
                href: "/educator/assessments",
                icon: ClipboardDocumentListIcon,
            },
            {
                label: "Reports",
                href: "/educator/reports",
                icon: ChartBarIcon,
            }
        ],
    },
    {
        title: "Settings",
        links: [
            {
                label: "Settings",
                href: "/educator/settings",
                icon: Cog8ToothIcon,
            },
            ...SHARED_NAVIGATIONS,
        ],
    },
];

export const ADMIN_NAVIGATIONS: NavGroup[] = [
    {
        title: "Main",
        links: [
            {
                label: "Dashboard",
                href: "/admin/dashboard",
                icon: HomeIcon,
            },
        ],
    },
    {
        title: "Navigation",
        links: [
            {
                label: "Educator Dashboard",
                href: "/educator/dashboard",
                icon: UserIcon,
            },
            {
                label: "Student Dashboard",
                href: "/student/dashboard",
                icon: UserIcon,
            },
        ]
    },
    {
        title: "Settings",
        links: [
            {
                label: "Settings",
                href: "/admin/settings",
                icon: Cog8ToothIcon,
            },
            ...SHARED_NAVIGATIONS,
        ],
    },
];