# Frontend Fix Guide: Prevent Duplicate Email Registration

## Problem Summary
Currently, the registration flow allows payment to proceed even if the email is already registered. This results in:
1. ✅ Payment succeeds
2. ❌ Registration fails (duplicate email)
3. ❌ User loses money but account is not created

## Solution Overview
Add email validation **BEFORE** the payment step to prevent this issue.

---

## Step-by-Step Fix

### Step 1: Add Email Check Method to AttendeeService

**File:** `exhibition-frontend/src/app/services/attendee.service.ts`

Add this new method to check if an email is already registered:

```typescript
checkEmailAvailability(email: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/attendees/check-email`, { email });
}
```

**Location:** Add this method alongside other methods like `registerAttendee()` and `createPayment()`

---

### Step 2: Update RegisterAttendeeComponent

**File:** `exhibition-frontend/src/app/components/register-attendee/register-attendee.component.ts`

#### 2.1: Add Email Checking State

Add this property after line 60 (after `cardElementMounted`):

```typescript
isCheckingEmail: boolean = false;
```

#### 2.2: Replace the `onRegisterSubmit()` Method

**Find this method (around line 77):**
```typescript
async onRegisterSubmit() {
  if (this.validateForm()) {
    // Don't register yet - just validate and move to payment step
    // Registration will happen after successful payment
    this.isSubmitting = false;
    
    // Move to payment step
    this.currentStep = 2;
    
    // Initialize Stripe card element for step 2
    this.initializeStripe();
  }
}
```

**Replace it with:**
```typescript
async onRegisterSubmit() {
  if (!this.validateForm()) {
    return;
  }

  // Check if email is already registered BEFORE proceeding to payment
  this.isCheckingEmail = true;
  this.isSubmitting = true;

  try {
    const emailCheckResponse: any = await this.attendeeService
      .checkEmailAvailability(this.attendee.email)
      .toPromise();

    // Email is available
    if (emailCheckResponse.available === true) {
      this.isSubmitting = false;
      this.isCheckingEmail = false;
      
      // Move to payment step
      this.currentStep = 2;
      
      // Initialize Stripe card element for step 2
      this.initializeStripe();
    } else {
      // Email is not available
      this.isSubmitting = false;
      this.isCheckingEmail = false;
      
      this.snackBar.open(
        'This email is already registered. Please use a different email or try logging in.',
        'Close',
        {
          duration: 6000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        }
      );
    }
  } catch (error: any) {
    this.isCheckingEmail = false;
    this.isSubmitting = false;

    // If we get a 400 error, it means email is already taken
    if (error.status === 400) {
      const errorMessage = error.error?.error || 
        'This email is already registered. Please use a different email or try logging in.';
      
      this.snackBar.open(errorMessage, 'Close', {
        duration: 6000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    } else {
      // Other errors (network, server, etc.)
      this.snackBar.open(
        'Unable to verify email. Please try again.',
        'Close',
        {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        }
      );
    }
  }
}
```

#### 2.3: Update the Error Handling in `onPaymentSubmit()`

**Find this section (around line 200):**
```typescript
error: (error: any) => {
  console.error('Failed to register attendee after payment:', error);
  this.isSubmitting = false;
  let errorMessage = 'Payment succeeded but registration failed. Please contact support.';
  
  if (error.error && error.error.error) {
    if (error.error.error.includes('email') || error.error.error.includes('Email')) {
      errorMessage = 'Payment succeeded but this email is already registered. Please contact support.';
    } else if (error.error.error.includes('phone') || error.error.error.includes('Phone')) {
      errorMessage = 'Payment succeeded but this phone number is already registered. Please contact support.';
    } else {
      errorMessage = 'Payment succeeded but registration failed: ' + error.error.error;
    }
  }
```

**This is already correct!** The error handling is good, but with our email check, this should never happen.

---

### Step 3: Update the Registration Button UI (Optional but Recommended)

**File:** `exhibition-frontend/src/app/components/register-attendee/register-attendee.component.html`

Find the "Continue to Payment" button and update it to show loading state:

**Find:**
```html
<button mat-raised-button color="primary" 
        (click)="onRegisterSubmit()" 
        [disabled]="isSubmitting">
  Continue to Payment
</button>
```

**Replace with:**
```html
<button mat-raised-button color="primary" 
        (click)="onRegisterSubmit()" 
        [disabled]="isSubmitting || isCheckingEmail">
  <span *ngIf="!isCheckingEmail">Continue to Payment</span>
  <span *ngIf="isCheckingEmail">Checking email...</span>
</button>
```

---

## Testing the Fix

### Test Case 1: New Email (Should Work)
1. Go to registration page
2. Enter a **new email** that hasn't been used before
3. Fill in all other fields
4. Click "Continue to Payment"
5. ✅ Should proceed to payment step
6. Complete payment
7. ✅ Registration should succeed

### Test Case 2: Existing Email (Should Block)
1. Go to registration page
2. Enter an **existing email** (e.g., one from the Stripe dashboard)
3. Fill in all other fields
4. Click "Continue to Payment"
5. ✅ Should show error: "This email is already registered..."
6. ✅ Should NOT proceed to payment
7. ✅ User does not lose money

### Test Case 3: Network Error
1. Disconnect internet
2. Try to register
3. ✅ Should show: "Unable to verify email. Please try again."

---

## Summary of Changes

| File | Change | Purpose |
|------|--------|---------|
| `attendee.service.ts` | Add `checkEmailAvailability()` method | Call backend email check endpoint |
| `register-attendee.component.ts` | Add `isCheckingEmail` property | Track email checking state |
| `register-attendee.component.ts` | Update `onRegisterSubmit()` method | Check email before payment |
| `register-attendee.component.html` | Update button text (optional) | Show "Checking email..." state |

---

## Backend Endpoints Used

The backend already has these endpoints ready:

1. **Email Check (NEW):**
   - `POST /attendees/check-email`
   - Body: `{ "email": "user@example.com" }`
   - Response: `{ "available": true/false, "error": "..." }`

2. **Registration (EXISTING):**
   - `POST /attendees`
   - Returns proper error if email exists

---

## Expected Behavior After Fix

### Before Fix:
1. User enters existing email
2. Proceeds to payment ❌
3. Payment succeeds ✅
4. Registration fails ❌
5. User loses $200 💸

### After Fix:
1. User enters existing email
2. System checks email ✅
3. Shows error immediately ✅
4. Does NOT proceed to payment ✅
5. User keeps their money 💰

---

## Need Help?

If you encounter any issues:
1. Check browser console for errors
2. Verify the backend is running
3. Test the email check endpoint directly:
   ```bash
   curl -X POST https://exhibition-backend-9jxh.onrender.com/attendees/check-email \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

---

## Deployment Checklist

- [ ] Update `attendee.service.ts`
- [ ] Update `register-attendee.component.ts`
- [ ] Update `register-attendee.component.html` (optional)
- [ ] Test with new email
- [ ] Test with existing email
- [ ] Test network error handling
- [ ] Deploy to production
- [ ] Verify on live site

---

**This fix will prevent users from losing money due to duplicate email registrations!**
