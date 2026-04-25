export type NavLink = {
    label: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}
export type NavGroup = {
    title: string;
    links: NavLink[];
}
