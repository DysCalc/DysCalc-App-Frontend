// "use client";
// import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

// type ClassCardProps = {
//   title?: string;
//   students?: number;
//   variant?: "green" | "blue" | "gray" | "yellow" | "empty";
//   onClick?: () => void;
//   className?: string;
// };

// const variantStyles = {
//   yellow: {
//     bg: "bg-[#E3d860]",
//     text: "text-[#827D2A]",
//     sub: "text-[#827D2A]/80",
//     border: "border border-[#D9D9D9]",
//   },
//   green: {
//     bg: "bg-[#29A177]",
//     text: "text-white",
//     sub: "text-white/80",
//     border: "border border-[#D9D9D9]",
//   },
//   blue: {
//     bg: "bg-[#608CCC]",
//     text: "text-white",
//     sub: "text-white/80",
//     border: "border border-[#D9D9D9]",
//   },
//   gray: {
//     bg: "bg-[#F5F5F5]",
//     text: "text-[#6C6C6C]",
//     sub: "text-[#6C6C6C]/80",
//     border: "border border-[#D9D9D9]",
//   },
//   empty: {
//     bg: "bg-[#F8F8F8]",
//     text: "text-[#A0A0A0]",
//     sub: "text-[#A0A0A0]",
//     border: "border border-dashed border-[#D9D9D9]",
//   },
// };

// export default function ClassCard({
//   title,
//   students,
//   variant = "green",
//   onClick,
//   className = "",
// }: ClassCardProps) {
//   const styles = variantStyles[variant];

//   return (
//     <div
//       onClick={onClick}
//       className={`
//         group relative
//         flex flex-col items-start justify-end
//         rounded-xl px-6 py-5 text-left
//         transition-all duration-200 cursor-pointer
//         ${styles.bg} ${styles.border}
//         ${variant !== "empty" ? "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]" : ""}
//         ${variant === "empty" ? "items-center justify-center" : "w-full"}
//         ${className}
//       `}
//     >
//       {variant !== "empty" && (
//         <div
//           className="
//             absolute top-3 right-3
//             opacity-0 scale-90
//             transition-all duration-200
//             group-hover:opacity-100 group-hover:scale-100
//           "
//         >
//           <button
//             type="button"
//             onClick={(e) => {
//               e.stopPropagation();
//               console.log("Open menu");
//             }}
//             className="rounded-md p-1 hover:bg-black/10"
//           >
//             <EllipsisVerticalIcon className="h-5 w-5 text-white/80 hover:text-white" />
//           </button>
//         </div>
//       )}

//       {variant === "empty" ? (
//         <span className="text-sm font-medium text-[#A0A0A0]">
//           + Add Class
//         </span>
//       ) : (
//         <>
//           <span className={`text-xl font-semibold leading-none ${styles.text}`}>
//             {title}
//           </span>

//           <span className={`mt-1 text-sm leading-none ${styles.sub}`}>
//             {students} {students === 1 ? "student" : "students"}
//           </span>
//         </>
//       )}
//     </div>
//   );
// }


"use client";

import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

type ClassCardProps = {
  title?: string;
  students?: number;
  variant?: "green" | "blue" | "gray" | "yellow" | "empty";
  onClick?: () => void;
  onMenuClick?: () => void;
  className?: string;
};

const variantStyles = {
  yellow: {
    bg: "bg-[#E3d860]",
    text: "text-[#827D2A]",
    sub: "text-[#827D2A]/80",
    border: "border border-[#D9D9D9]",
    icon: "text-[#827D2A]/80 hover:text-[#827D2A]",
    hover: "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
  },
  green: {
    bg: "bg-[#29A177]",
    text: "text-white",
    sub: "text-white/80",
    border: "border border-[#D9D9D9]",
    icon: "text-white/80 hover:text-white",
    hover: "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
  },
  blue: {
    bg: "bg-[#608CCC]",
    text: "text-white",
    sub: "text-white/80",
    border: "border border-[#D9D9D9]",
    icon: "text-white/80 hover:text-white",
    hover: "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
  },
  gray: {
    bg: "bg-[#6C6C6C]",
    text: "text-white",
    sub: "text-white/80",
    border: "border border-[#D9D9D9]",
    icon: "text-white/80 hover:text-white",
    hover: "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
  },
  empty: {
    bg: "bg-[#F8F8F8]",
    text: "text-[#A0A0A0]",
    sub: "text-[#A0A0A0]",
    border: "border border-dashed border-[#D9D9D9]",
    icon: "text-[#A0A0A0]",
    hover: "",
  },
};

export default function ClassCard({
  title,
  students,
  variant = "green",
  onClick,
  onMenuClick,
  className = "",
}: ClassCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`
        group relative flex flex-col rounded-xl px-6 py-5 text-left transition-all duration-200
        ${styles.bg} ${styles.border} ${styles.hover}
        ${variant === "empty" ? "items-center justify-center" : "w-full items-start justify-end"}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {variant !== "empty" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMenuClick?.();
          }}
          className="
            absolute top-3 right-3 rounded-md p-1
            opacity-0 scale-90 transition-all duration-200
            group-hover:opacity-100 group-hover:scale-100
            hover:bg-black/10
          "
          aria-label="Open class menu"
        >
          <EllipsisVerticalIcon className={`h-5 w-5 ${styles.icon}`} />
        </button>
      )}

      {variant === "empty" ? (
        <span className="text-sm font-medium text-[#A0A0A0]">
          + Add Class
        </span>
      ) : (
        <>
          <span className={`text-xl font-semibold leading-none ${styles.text}`}>
            {title}
          </span>

          <span className={`mt-1 text-sm leading-none ${styles.sub}`}>
            {students} {students === 1 ? "student" : "students"}
          </span>
        </>
      )}
    </div>
  );
}