# Dialogue Localization Prompt

Convert Chinese short-drama dialogue into US English dialogue that still performs the same story function.

Return three versions:

- `literal_safe`
- `americanized_balanced`
- `high_drama_us_shortform`

Rules:

- Do not translate literally if it sounds unnatural.
- Respect shot duration and speaking cadence.
- Keep conflict, humiliation, revenge, and misunderstanding scenes emotionally sharp.
- Default editorial choice should usually be `americanized_balanced`.

