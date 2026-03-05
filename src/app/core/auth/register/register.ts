import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  // locum | carehome-individual | carehome-multiple
  currentMode: 'locum' | 'carehome-individual' | 'carehome-multiple' | null = 'locum';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.buildForm('locum');
  }

  private buildForm(
    mode: 'locum' | 'carehome-individual' | 'carehome-multiple'
  ): FormGroup {
    const passwordValidators = [
      Validators.required,
      Validators.minLength(8),
      // at least 1 lowercase, 1 uppercase, 1 digit, 1 special char
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
    ];

    if (mode === 'locum') {
      return this.fb.group(
        {
          firstName: ['', [Validators.required, Validators.minLength(2)]],
          lastName: ['', [Validators.required, Validators.minLength(2)]],
          email: ['', [Validators.required, Validators.email]],
          phoneNumber: ['', [Validators.required]],
          dateOfBirth: ['', Validators.required],
          gender: ['', Validators.required],
          apartmentNumber: ['', Validators.required],
          street: ['', Validators.required],
          city: ['', Validators.required],
          state: ['', Validators.required],
          postalCode: ['', Validators.required],
          country: ['', Validators.required],
          password: ['', passwordValidators],
          confirmPassword: ['', Validators.required]
        },
        { validators: this.passwordMatchValidator }
      );
    }

    if (mode === 'carehome-individual') {
      return this.fb.group(
        {
          firstName: ['', [Validators.required, Validators.minLength(2)]],
          lastName: ['', [Validators.required, Validators.minLength(2)]],
          phone: ['', [Validators.required]],
          gender: ['', Validators.required],
          apartment: ['', Validators.required],
          street: ['', Validators.required],
          city: ['', Validators.required],
          state: ['', Validators.required],
          postalCode: ['', Validators.required],
          country: ['', Validators.required],
          customerFirstName: ['', [Validators.required, Validators.minLength(2)]],
          customerLastName: ['', [Validators.required, Validators.minLength(2)]],
          accountEmail: ['', [Validators.required, Validators.email]],
          password: ['', passwordValidators],
          confirmPassword: ['', Validators.required]
        },
        { validators: this.passwordMatchValidator }
      );
    }

    // carehome-multiple
    return this.fb.group(
      {
        businessLicenseNumber: ['', Validators.required],
        legalEntityName: ['', Validators.required],
        legalEntityAddress: ['', Validators.required],
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        postalCode: ['', Validators.required],
        country: ['', Validators.required],
        houseNumber: ['', Validators.required],
        postcode: ['', Validators.required],
        covidVaccinationRequired: [false],
        fluVaccinationRequired: [false],
        contactFirstName: ['', [Validators.required, Validators.minLength(2)]],
        contactLastName: ['', [Validators.required, Validators.minLength(2)]],
        contactPhone: ['', [Validators.required]],
        accountEmail: ['', [Validators.required, Validators.email]],
        password: ['', passwordValidators],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.registerForm.get(controlName);
    return control
      ? control.hasError(errorName) && (control.dirty || control.touched)
      : false;
  }

  switchMode(mode: 'locum' | 'carehome-individual' | 'carehome-multiple'): void {
    if (this.currentMode === mode) return;
    this.currentMode = mode;
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.registerForm = this.buildForm(mode);
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword' = 'password'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit() {
    if (!this.currentMode || this.registerForm.invalid) return;
    this.isLoading = true;

    const data = this.registerForm.value;
    let payload: any;
    let typePath = '';

    if (this.currentMode === 'locum') {
      payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
        // backend expects ISO string for dateOfBirth
        dateOfBirth: new Date(data.dateOfBirth).toISOString(),
        gender: data.gender,
        address: {
          apartmentNumber: Number(data.apartmentNumber) || 0,
          street: data.street,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country
        }
      };
      // PSW locum endpoint
      typePath = 'psw';
    } else if (this.currentMode === 'carehome-individual') {
      payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        gender: data.gender,
        apartment: data.apartment,
        street: data.street,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        customerFirstName: data.customerFirstName,
        customerLastName: data.customerLastName,
        accountEmail: data.accountEmail,
        password: data.password
      };
      typePath = 'carehome/individual';
    } else {
      payload = {
        businessLicenseNumber: data.businessLicenseNumber,
        legalEntityName: data.legalEntityName,
        legalEntityAddress: data.legalEntityAddress,
        street: data.street,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        houseNumber: data.houseNumber,
        postcode: data.postcode,
        covidVaccinationRequired: data.covidVaccinationRequired,
        fluVaccinationRequired: data.fluVaccinationRequired,
        contactFirstName: data.contactFirstName,
        contactLastName: data.contactLastName,
        contactPhone: data.contactPhone,
        accountEmail: data.accountEmail,
        password: data.password
      };
      typePath = 'carehome/multiple';
    }

    console.log('Register payload:', payload, 'type:', typePath);

    this.authService
      .register(payload, typePath)
      .pipe(first())
      .subscribe({
        next: () => {
          alert('Registration Successful!');
          this.router.navigate(['/login']);
        },
        error: err => {
          console.error('Registration failed', err);
          console.error('Backend error body:', err?.error);
          this.isLoading = false;
        }
      });
  }
}