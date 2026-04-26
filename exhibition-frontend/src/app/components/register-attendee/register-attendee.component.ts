import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AttendeeService } from '../../services/attendee.service';
import { ValidationService } from '../../services/validation.service';
import { loadStripe } from '@stripe/stripe-js';
import { StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

interface Attendee {
  name: string;
  email: string;
  phone: string;
  password: string;
}

@Component({
  selector: 'app-register-attendee',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './register-attendee.component.html',
  styleUrls: ['./register-attendee.component.css']
})
export class RegisterAttendeeComponent {
  attendee: Attendee = {
    name: '',
    email: '',
    phone: '',
    password: ''
  };
  
  confirmPassword: string = '';
  isSubmitting: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  currentStep: number = 1; // 1 = Registration, 2 = Payment, 3 = Receipt
  paymentAmount: number = 200; // Registration fee
  registrationReceipt: {
    name: string;
    email: string;
    phone: string;
    amount: number;
    paymentIntentId: string;
    registrationId: string;
  } | null = null;

  stripePromise = loadStripe(environment.stripePublishableKey); 
  cardElement!: StripeCardElement;
  elements!: StripeElements;
  cardElementMounted: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<RegisterAttendeeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private attendeeService: AttendeeService,
    private validationService: ValidationService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    // Stripe will be initialized when we reach step 2
  }

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

  async initializeStripe() {
    if (this.cardElementMounted) return; // Already initialized
    
    const stripe = await this.stripePromise;
    if (stripe) {
      this.elements = stripe.elements();
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a',
          },
        },
        hidePostalCode: false,
      });
      
      // Wait for DOM to be ready, then mount
      setTimeout(() => {
        const cardElementDiv = document.getElementById('card-element');
        if (cardElementDiv && !this.cardElementMounted) {
          this.cardElement.mount('#card-element');
          this.cardElementMounted = true;
          
          // Listen for card element events
          this.cardElement.on('change', (event) => {
            if (event.error) {
              console.log('Card element error:', event.error.message);
            }
          });
        }
      }, 100);
    }
  }

  async onPaymentSubmit() {
    if (!this.cardElementMounted) {
      this.snackBar.open('Please wait for payment form to load.', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;

    try {
      // 1. Call backend to create PaymentIntent
      // Convert dollars to cents for Stripe (Stripe expects amount in cents)
      const amountInCents = this.paymentAmount * 100;
      const paymentResponse: any = await this.attendeeService.createPayment(amountInCents).toPromise();

      const stripe = await this.stripePromise;

      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // 2. Confirm the payment on frontend
      const { error, paymentIntent } = await stripe.confirmCardPayment(paymentResponse.clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: { email: this.attendee.email }
        }
      });

      if (error) {
        this.snackBar.open('Payment failed: ' + error.message, 'Close', { 
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.isSubmitting = false;
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded - now register the attendee with payment fee
        // paymentAmount is already in dollars (200 = $200.00), paymentIntent.amount is in cents
        const paymentAmountInDollars = paymentIntent.amount ? (paymentIntent.amount / 100) : this.paymentAmount;
        
        // Create attendee object with payment fee and payment intent
        // (receipt will be available for download in the attendee dashboard)
        const attendeeWithPayment: any = {
          ...this.attendee,
          paymentFee: paymentAmountInDollars,
          paymentIntentId: paymentIntent.id || ''
        };
        
        // Register the attendee - receipt is no longer sent by email
        // and can be downloaded later from the attendee's profile tab
        this.attendeeService.registerAttendee(attendeeWithPayment).subscribe({
          next: (response: any) => {
            console.log('Attendee registered successfully');
            this.isSubmitting = false;
            
            this.snackBar.open('Registration complete! You can download your receipt from your attendee dashboard after logging in.', 'Close', { 
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            
            this.dialogRef.close({ 
              success: true, 
              email: this.attendee.email
            });
          },
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
            
            this.snackBar.open(errorMessage, 'Close', { 
              duration: 6000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            
            // Still close dialog but indicate there was an issue
            this.dialogRef.close({ 
              success: false, 
              email: this.attendee.email,
              paymentIntentId: paymentIntent.id,
              amount: paymentAmountInDollars,
              registrationError: true
            });
          }
        });
      }
    } catch (err: any) {
      console.error('Payment flow error:', err);
      this.snackBar.open('Payment failed. Please try again.', 'Close', { 
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      this.isSubmitting = false;
    }
  }

  goBackToRegistration() {
    // Unmount Stripe element when going back
    if (this.cardElement && this.cardElementMounted) {
      this.cardElement.unmount();
      this.cardElementMounted = false;
    }
    this.currentStep = 1;
  }

  validateForm(): boolean {
    // Validate name
    const nameValidation = this.validationService.validateName(this.attendee.name);
    if (!nameValidation.isValid) {
      this.snackBar.open(nameValidation.message, 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate email
    const emailValidation = this.validationService.validateEmail(this.attendee.email);
    if (!emailValidation.isValid) {
      this.snackBar.open(emailValidation.message, 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate phone
    const phoneValidation = this.validationService.validatePhone(this.attendee.phone);
    if (!phoneValidation.isValid) {
      this.snackBar.open(phoneValidation.message, 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Validate password
    const passwordValidation = this.validationService.validatePassword(this.attendee.password);
    if (!passwordValidation.isValid) {
      this.snackBar.open(passwordValidation.message, 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    // Check if passwords match
    const passwordMatchValidation = this.validationService.validatePasswordMatch(this.attendee.password, this.confirmPassword);
    if (!passwordMatchValidation.isValid) {
      this.snackBar.open(passwordMatchValidation.message, 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return false;
    }

    return true;
  }

  onCancel() {
    // If on payment step and user cancels, inform them that registration is not complete
    if (this.currentStep === 2) {
      const confirmClose = confirm('Payment is incomplete. Your account has not been created yet. Close anyway?');
      if (!confirmClose) return;
    }
    this.dialogRef.close();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getPasswordStrength(): string {
    const password = this.attendee.password;
    if (password.length === 0) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  }

  getPasswordStrengthColor(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return '#f44336';
      case 'medium': return '#ff9800';
      case 'strong': return '#4caf50';
      default: return '#757575';
    }
  }
}
