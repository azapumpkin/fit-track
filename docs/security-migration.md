# P0 security migration notes

## Food ownership

The migration adds nullable `Food.ownerId` without rewriting or deleting data.
Existing rows remain system products (`ownerId IS NULL`) and stay referenced by
existing diary entries. New API-created products are always assigned to the
authenticated user. System products are readable by every authenticated user
and immutable through the user API; user products are readable and mutable only
by their owner. `isCustom` remains in place for frontend compatibility.

Apply the migration only through the normal reviewed release process. This
change does not connect to or modify production by itself.

## Legacy password risk

Migration `20260914142520_add_password_hash` copied the old `password` column
verbatim into `passwordHash`. Accounts that existed at that moment may therefore
contain plaintext rather than bcrypt hashes. No production database was queried
while preparing this change, and no password values should ever be selected,
logged, exported, or printed.

For a future separately approved investigation, use a read-only database role
and run `backend/scripts/audit-password-hash-formats.sql`. It returns counts only.
If `suspected_legacy_plaintext` is non-zero, stop and prepare a separately
approved user-notification/password-reset plan. Do not hash unknown legacy values
in place and do not reset accounts as part of this migration.
