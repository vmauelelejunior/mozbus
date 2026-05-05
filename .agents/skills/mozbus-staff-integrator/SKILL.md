# Skill: MozBus Staff Integrator

## Objective
Finalize the logic for assigning Fiscals to specific Buses, ensuring full backend-frontend integration.

## Steps
1. **Backend:**
   - Add a `PATCH` endpoint to update the `fiscalId` of a `Bus`.
   - Ensure the user making the request has `COMPANY_ADMIN` or `SUPER_ADMIN` role.
2. **Frontend:**
   - In `/dashboard/staff`, add a "Vincular Autocarro" button to the Fiscal cards.
   - Open a modal with a list of available buses for the company.
   - Call the backend endpoint on selection.
3. **Verification:**
   - Check that the Fiscal can now see the assigned trip in their mobile view.
