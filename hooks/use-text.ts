export function toProperCase(name: string) {
    if (!name) return "";
    return name
        .toLowerCase()
        .split(" ")
        .map(word =>
            word.split("-").map(part =>
                part.charAt(0).toUpperCase() + part.slice(1)
            ).join("-")
        )
        .join(" ");
}