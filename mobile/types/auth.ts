export type AuthUser = {
    id: string;
    email: string;
    username: string;
    display_name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type TokenPair = {
    access_token: string;
    refresh_token: string;
    token_type: string;
};

export type RegisterPayload = {
    email: string;
    username: string;
    display_name: string;
    password: string;
};

export type LoginPayload = {
    login: string;
    password: string;
};
