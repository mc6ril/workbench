# Manual Testing Checklist - Auth Flows (Ticket 20)

This document provides a checklist for manually testing the authentication flows implementation (email verification, password reset, unverified user handling).

## Prerequisites

- Development server running (`npm run dev`)
- Access to browser dev tools (Network tab, Console)
- Test email account: cyril.lesot@yahoo.fr
- Test password: Azerty123!
- Access to email inbox for verification/reset links
- Supabase dashboard access to verify redirect URLs configuration

## Test Scenarios

### 1. Email Verification Flow End-to-End

- [ ] **Signup with Email Verification**
  - Navigate to `/signup`
  - Enter email: `cyril.lesot@yahoo.fr`
  - Enter password: `Azerty123!`
  - Submit form
  - Expected: Success message displayed: "Un email de vérification a été envoyé à votre adresse."
  - Expected: User stays on signup page (no redirect)
  - Expected: Instructions displayed: "Veuillez vérifier votre boîte de réception et cliquer sur le lien pour vérifier votre compte."

- [ ] **Email Received**
  - Check email inbox for `cyril.lesot@yahoo.fr`
  - Expected: Verification email received from Supabase
  - Expected: Email contains verification link
  - Expected: Link format: `http://localhost:3000/auth/verify-email?token=...&type=email&email=...`

- [ ] **Email Verification via Link**
  - Click verification link in email
  - Expected: Redirected to `/auth/verify-email` with token and email parameters
  - Expected: Loading state displayed: "Chargement en cours..."
  - Expected: Success message displayed: "Votre email a été vérifié avec succès."
  - Expected: Auto-redirect to `/myworkspace` after successful verification
  - Expected: User is logged in automatically

- [ ] **Login After Verification**
  - Navigate to `/signin`
  - Enter email: `cyril.lesot@yahoo.fr`
  - Enter password: `Azerty123!`
  - Submit form
  - Expected: Successful login
  - Expected: Redirect to `/myworkspace`
  - Expected: No email verification error

### 2. Password Reset Flow End-to-End

- [ ] **Request Password Reset**
  - Navigate to `/signin`
  - Click "Mot de passe oublié ?" link
  - Expected: Redirected to `/auth/reset-password`
  - Enter email: `cyril.lesot@yahoo.fr`
  - Submit form
  - Expected: Success message displayed: "Un email de réinitialisation a été envoyé à votre adresse."
  - Expected: Instructions displayed: "Veuillez vérifier votre boîte de réception et cliquer sur le lien pour réinitialiser votre mot de passe."

- [ ] **Password Reset Email Received**
  - Check email inbox for `cyril.lesot@yahoo.fr`
  - Expected: Password reset email received from Supabase
  - Expected: Email contains reset link
  - Expected: Link format: `http://localhost:3000/auth/update-password?token=...&type=recovery&email=...`

- [ ] **Update Password via Link**
  - Click password reset link in email
  - Expected: Redirected to `/auth/update-password` with token, type=recovery, and email parameters
  - Enter new password: `NewPassword123!`
  - Enter confirm password: `NewPassword123!`
  - Submit form
  - Expected: Loading state displayed
  - Expected: Success message displayed: "Votre mot de passe a été mis à jour avec succès."
  - Expected: Auto-redirect to `/myworkspace` after successful update
  - Expected: User is logged in automatically

- [ ] **Login with New Password**
  - Navigate to `/signin`
  - Enter email: `cyril.lesot@yahoo.fr`
  - Enter new password: `NewPassword123!`
  - Submit form
  - Expected: Successful login
  - Expected: Redirect to `/myworkspace`
  - Expected: Old password no longer works

### 3. Unverified User Sign-In Error Handling

- [ ] **Signup Without Verifying Email**
  - Create new account (or use unverified account)
  - Do NOT verify email
  - Navigate to `/signin`
  - Enter email and password
  - Submit form
  - Expected: Error message displayed: "Votre email n'a pas été vérifié. Veuillez vérifier votre boîte de réception et cliquer sur le lien de vérification."
  - Expected: "Renvoyer l'email de vérification" button displayed

- [ ] **Resend Verification Email**
  - Click "Renvoyer l'email de vérification" button
  - Expected: Button shows loading state: "Chargement en cours..."
  - Expected: Success message displayed: "Email de vérification envoyé. Veuillez vérifier votre boîte de réception."
  - Expected: New verification email received

- [ ] **Unverified User Accessing Protected Route**
  - While unverified, try to access `/myworkspace`
  - Expected: Middleware redirects to `/signin?unverified=true`
  - Expected: Error message displayed automatically on signin page
  - Expected: "Renvoyer l'email de vérification" button displayed

### 4. Expired Token Handling

- [ ] **Expired Verification Token**
  - Wait for verification token to expire (or use old token)
  - Access `/auth/verify-email?token=expired_token&type=email&email=...`
  - Expected: Error message displayed: "Le lien de vérification est invalide ou a expiré. Veuillez demander un nouveau lien."
  - Expected: "Retour à la connexion" link displayed
  - Expected: User can request new verification email from signin page

- [ ] **Expired Password Reset Token**
  - Wait for password reset token to expire (or use old token)
  - Access `/auth/update-password?token=expired_token&type=recovery&email=...`
  - Expected: Error message displayed: "Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien."
  - Expected: "Retour à la connexion" link displayed
  - Expected: User can request new password reset email

### 5. Invalid Token Handling

- [ ] **Invalid Verification Token**
  - Access `/auth/verify-email?token=invalid_token&type=email&email=cyril.lesot@yahoo.fr`
  - Expected: Error message displayed: "Le lien de vérification est invalide ou a expiré. Veuillez demander un nouveau lien."
  - Expected: "Retour à la connexion" link displayed

- [ ] **Invalid Password Reset Token**
  - Access `/auth/update-password?token=invalid_token&type=recovery&email=cyril.lesot@yahoo.fr`
  - Expected: Error message displayed: "Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien."
  - Expected: "Retour à la connexion" link displayed

- [ ] **Missing Token Parameters**
  - Access `/auth/verify-email` (no parameters)
  - Expected: Error message displayed: "Lien de vérification invalide. Le token ou l'email est manquant."
  - Expected: "Retour à la connexion" link displayed

- [ ] **Missing Password Reset Parameters**
  - Access `/auth/update-password` (no parameters)
  - Expected: Error message displayed: "Lien de réinitialisation invalide. Le token ou l'email est manquant."
  - Expected: "Retour à la connexion" link displayed

- [ ] **Wrong Token Type**
  - Access `/auth/verify-email?token=valid_token&type=recovery&email=...` (wrong type)
  - Expected: Token not processed (type mismatch)
  - Expected: Error message displayed

### 6. Network Error Handling

- [ ] **Network Error During Verification**
  - Disconnect network
  - Access verification link
  - Expected: Error message displayed: "Une erreur s'est produite lors de la vérification de l'email."
  - Expected: User can retry after reconnecting

- [ ] **Network Error During Password Reset Request**
  - Disconnect network
  - Submit password reset form
  - Expected: Error message displayed: "Une erreur s'est produite lors de l'envoi de l'email"
  - Expected: User can retry after reconnecting

- [ ] **Network Error During Password Update**
  - Disconnect network
  - Submit password update form
  - Expected: Error message displayed: "Une erreur s'est produite lors de la mise à jour du mot de passe."
  - Expected: User can retry after reconnecting

### 7. Supabase Redirect URLs Configuration

- [ ] **Verify Redirect URLs in Supabase Dashboard**
  - Access Supabase dashboard → Authentication → URL Configuration
  - Expected: Site URL configured: `http://localhost:3000` (or production URL)
  - Expected: Redirect URLs include:
    - `http://localhost:3000/auth/verify-email`
    - `http://localhost:3000/auth/update-password`
  - Expected: Wildcard pattern allowed if needed: `http://localhost:3000/**`

- [ ] **Email Templates Configuration**
  - Access Supabase dashboard → Authentication → Email Templates
  - Expected: "Confirm signup" template configured
  - Expected: "Reset password" template configured
  - Expected: Templates include correct redirect URLs

### 8. UI/UX Verification

- [ ] **Loading States**
  - All forms show loading state during submission
  - Expected: Button disabled during operation
  - Expected: Loading text displayed: "Chargement en cours..."

- [ ] **Error Messages**
  - All error messages are clear and actionable
  - Expected: Error messages use i18n keys (French)
  - Expected: Error messages displayed with `role="alert"` for accessibility

- [ ] **Success Messages**
  - All success messages are clear
  - Expected: Success messages use i18n keys (French)
  - Expected: Success messages displayed with `role="status"` and `aria-live="polite"`

- [ ] **Accessibility (WCAG 2.1 AA)**
  - All forms have proper labels
  - Expected: Input fields linked with `<label>` elements
  - Expected: Error messages associated with fields via `aria-describedby`
  - Expected: Buttons have `aria-label` attributes
  - Expected: Focus indicators visible
  - Expected: Keyboard navigation works

- [ ] **Responsive Design**
  - Test on mobile devices
  - Expected: Forms are usable on mobile
  - Expected: Text is readable
  - Expected: Buttons are tappable

### 9. Edge Cases

- [ ] **Already Verified Email**
  - Try to verify already verified email
  - Expected: Handled gracefully (may show success or error)

- [ ] **Password Mismatch**
  - On update password page, enter different passwords
  - Expected: Validation error: "Les mots de passe ne correspondent pas"
  - Expected: Error displayed on confirm password field

- [ ] **Weak Password**
  - On update password page, enter weak password (< 6 characters)
  - Expected: Validation error: "Le mot de passe doit contenir au moins 6 caractères"

- [ ] **Invalid Email Format**
  - On reset password page, enter invalid email
  - Expected: Validation error: "Adresse email invalide"

- [ ] **Multiple Reset Requests**
  - Request password reset multiple times quickly
  - Expected: Each request handled correctly
  - Expected: Multiple emails received (or rate limiting applied)

### 10. Integration with Route Guards

- [ ] **Unverified User Blocked**
  - Signup without verifying
  - Try to access `/myworkspace`
  - Expected: Middleware redirects to `/signin?unverified=true`
  - Expected: Error message displayed on signin page

- [ ] **Verified User Access**
  - Verify email
  - Access `/myworkspace`
  - Expected: Access granted
  - Expected: No redirects

## Performance Verification

- [ ] **Fast Response Times**
  - All form submissions respond quickly
  - Expected: < 2 seconds for API calls
  - Expected: No unnecessary re-renders

- [ ] **Optimized Re-renders**
  - Check React DevTools Profiler
  - Expected: Error messages memoized with `useMemo`
  - Expected: URL parameters memoized with `useMemo`

## Code Quality Verification

- [ ] **TypeScript Compilation**
  - Run `npx tsc --noEmit`
  - Expected: No TypeScript errors

- [ ] **ESLint**
  - Run `npm run lint` (if available)
  - Expected: No ESLint errors

- [ ] **Unit Tests**
  - Run `npm test` (if available)
  - Expected: All unit tests pass

## Sign-Off

- [ ] All test scenarios completed
- [ ] No critical issues found
- [ ] Edge cases handled appropriately
- [ ] Performance acceptable
- [ ] Accessibility requirements met
- [ ] Code quality verified

**Tester**: ********\_********  
**Date**: ********\_********  
**Status**: ********\_********
