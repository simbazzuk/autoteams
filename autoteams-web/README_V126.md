# AutoTeams v12.6 — Core Interview Reuse & Team DNA Health

## Interview behaviour

Atlas now asks:

1. Core Team DNA questions once per user.
2. Context-specific questions once for each contextual profile.

Creating a Friendship, Community, Sports or Education profile no longer repeats
the core interview after it has been completed.

## Profile creation

Creating a profile defines the context and fields. The user then selects
`Continue to Atlas Questions` to complete that profile's context interview.

## Team Builder

Team Builder does not ask profile questions. It uses completed contextual Team
DNA profiles from the selected workspace and Talent population.

## Team DNA health

Each contextual profile now shows:

- Last updated
- Confidence percentage
- Fresh, aging or stale status
- Refresh recommendation when over one year old

## Updated routes

- `/onboarding/profile`
- `/atlas`
- `/team-dna`

## Test

1. Create a Business profile.
2. Open Atlas and complete the core questions.
3. Complete the Business context questions.
4. Create a Friendship profile.
5. Return to Atlas.
6. Confirm only Friendship questions are asked.
7. Open Team DNA.
8. Review freshness and confidence.
9. Select Refresh This Profile.
10. Confirm only the selected context interview is refreshed.
