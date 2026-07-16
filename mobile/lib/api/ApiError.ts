export class ApiError extends Error {
    readonly status: number;
    readonly data: unknown;

    constructor(
        message: string,
        status: number,
        data: unknown = null
    ) {
        super(message)

        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}