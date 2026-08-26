export const formatOperationName = (value: string = ""): string => {
    return value
        .split(/(\s+)/)
        .map((part) => {
            if (!part || /^\s+$/.test(part)) {
                return part;
            }

            return (
                part.charAt(0).toLocaleUpperCase("vi-VN") +
                part.slice(1).toLocaleLowerCase("vi-VN")
            );
        })
        .join("");
};