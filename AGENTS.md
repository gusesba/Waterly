# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

# App Documentation

    The app documentation is on the /Docs directory

# Patch Notes

- Follow the workspace-level `AGENTS.md` instructions and update `PATCH_NOTES.md` for every implementation stage that changes the frontend or backend.
- Keep it synchronized with `../backend/PATCH_NOTES.md`.

# Localization

- Keep every user-facing string, including accessibility labels and units, in `constants/labels.ts`.
- Every new or changed user-facing string must include both `pt-BR` and `en` translations.
- UI layouts must grow and wrap with translated content. Do not rely on fixed text-container dimensions or manual line breaks.
