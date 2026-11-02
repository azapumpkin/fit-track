const MINIMUM_SECRET_LENGTH = 32;

function loadJwtSecret() {
    const secret = process.env.JWT_SECRET?.trim();

    if (!secret || secret.length < MINIMUM_SECRET_LENGTH) {
        throw new Error(
            `JWT_SECRET must be configured with at least ${MINIMUM_SECRET_LENGTH} characters`,
        );
    }

    return secret;
}

export const jwtConfig = Object.freeze({
    secret: loadJwtSecret(),
    algorithm: "HS256" as const,
    expiresIn: "7d" as const,
});
