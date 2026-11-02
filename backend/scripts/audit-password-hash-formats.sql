-- Run only through a separately approved, read-only database account.
-- This query returns aggregate counts and never reads password values into output.
SELECT
    COUNT(*) AS total_users,
    COUNT(*) FILTER (
        WHERE "passwordHash" ~ '^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$'
    ) AS bcrypt_hashes,
    COUNT(*) FILTER (
        WHERE "passwordHash" !~ '^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$'
    ) AS suspected_legacy_plaintext
FROM "User";
