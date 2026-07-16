type ValidationIssue = {
    msg?: unknown;
};

export function getApiErrorMessage(data: unknown, fallback = "Something went wrong. Please try again."): string {
    if(typeof data !== "object" || data === null || !("detail" in data)) {
        return fallback;
    }

    const detail = data.detail;

    if(typeof detail === "string") {
        return detail;
    }

    if(Array.isArray(detail)) {
        const messages = detail.map((issue: unknown) => {
            if(typeof issue === "object" && issue !== null && "msg" in issue) {
                const message = (issue as ValidationIssue).msg;

                return typeof message === "string" ? message : null;
            }

            return null;
        }).filter((message): message is string => message !== null);

        if(messages.length > 0) {
            return messages.join("\n");
        }
    }

    return fallback;
}