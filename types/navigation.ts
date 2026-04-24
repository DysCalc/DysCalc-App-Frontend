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

export const getStudentNavigations = (userId: string): NavGroup[] => [
    {
        title: "Main",
        links: [
            {
                label: "Dashboard",
                href: `/student/${userId}/dashboard`,
                icon: HomeIcon,
            },
        ],
    },
    {
        title: "Settings",
        links: [
            {
                label: "Settings",
                href: `/student/${userId}/settings`,
                icon: Cog8ToothIcon,
            },
            ...SHARED_NAVIGATIONS,
        ],
    },
];

export const getEducatorNavigations = (userId: string): NavGroup[] => [
    {
        title: "Main",
        links: [
            {
                label: "Dashboard",
                href: `/educator/${userId}/dashboard`,
                icon: HomeIcon,
            },
            {
                label: "Classroom",
                href: `/educator/${userId}/classroom`,
                icon: UserGroupIcon,
            },
            {
                label: "Assessments",
                href: `/educator/${userId}/assessments`,
                icon: ClipboardDocumentListIcon,
            },
            {
                label: "Reports",
                href: `/educator/${userId}/reports`,
                icon: ChartBarIcon,
            }
        ],
    },
    {
        title: "Settings",
        links: [
            {
                label: "Settings",
                href: `/educator/${userId}/settings`,
                icon: Cog8ToothIcon,
            },
            ...SHARED_NAVIGATIONS,
        ],
    },
];

export const getAdminNavigations = (userId: string): NavGroup[] => [
    {
        title: "Main",
        links: [
            {
                label: "Dashboard",
                href: `/admin/${userId}/dashboard`,
                icon: HomeIcon,
            },
        ],
    },
    {
        title: "Navigation",
        links: [
            {
                label: "Educator View",
                href: `/educator/${userId}/dashboard`,
                icon: AcademicCapIcon,
            },
            {
                label: "Student View",
                href: `/student/${userId}/dashboard`,
                icon: PencilIcon,
            },
        ]
    },
    {
        title: "Settings",
        links: [
            {
                label: "Settings",
                href: `/admin/${userId}/settings`,
                icon: Cog8ToothIcon,
            },
            ...SHARED_NAVIGATIONS,
        ],
    },
];