import {
    Cog8ToothIcon,
    HomeIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
    AcademicCapIcon,
    PencilIcon
} from "@heroicons/react/24/outline";

export type NavLink = {
    label: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}
export type NavGroup = {
    title: string;
    links: NavLink[];
}

const SHARED_NAVIGATIONS: NavLink[] = []

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
                label: "Educator View",
                href: "/educator/dashboard",
                icon: AcademicCapIcon,
            },
            {
                label: "Student View",
                href: "/student/dashboard",
                icon: PencilIcon,
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