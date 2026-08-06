# Firebase MFA Enablement Notes

AutoTeams v11.5 includes an MFA policy and readiness screen, but it does not
pretend MFA is active.

Before enabling MFA:

1. Review Firebase Authentication with Identity Platform pricing.
2. Enable Identity Platform for the Firebase project.
3. Choose supported factors.
4. Prefer TOTP authenticator applications for privileged roles.
5. Decide whether SMS is needed as a fallback and review SMS costs.
6. Add enrolment, reauthentication and recovery flows.
7. Add server-side role checks.
8. Test account recovery before enforcing MFA.
9. Require MFA for Owners and Administrators only after enrolment works.
10. Update the Privacy Notice and support process.

Do not enforce the UI policy until Firebase confirms the user's enrolled second
factor.
