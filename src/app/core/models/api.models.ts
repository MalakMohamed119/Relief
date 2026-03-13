export interface AddressDTO {
  apartmentNumber: number;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface RegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  dateOfBirth: string; 
  gender: string;
  address: AddressDTO;
}

export interface AuthResponseDTO {
  token?: string | null;
  expiresAtUtc: string;
  email?: string | null;
  role?: string | null;
  userId: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

/** POST /api/Offers – one shift item */
export interface CreateOfferShiftDto {
  date: string;       // "yyyy-MM-dd" e.g. "2026-03-04"
  startTime: string;  // e.g. "08:00:00"
  endTime: string;
}

/** POST /api/Offers – request body (application/json) */
export interface CreateJobOfferDto {
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  hourlyRate: number;
  shifts: CreateOfferShiftDto[];
}

export interface UpdateOfferShiftDto {
  shiftId?: string | null;
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

export interface UpdateJobOfferDto {
  title?: string | null;
  description?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  hourlyRate?: number | null;
  shifts?: UpdateOfferShiftDto[] | null;
}

export interface ApplyToOfferDto {
  offerId: string;
  shiftIds?: string[] | null;
}

export interface AcceptShiftDto {
  shiftId: string;
  jobRequestItemId: string;
}

export interface RejectShiftDto {
  jobRequestItemId: string;
}

export interface CancelApplicationDto {
  jobRequestItemId: string;
}

export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: AddressDTO;
}

export interface AdminRejectDto {
  reason: string;
}

export interface ProfileDto extends UpdateProfileDto {
  email?: string | null;
  id?: string;
  role?: string | null;
  profileImage?: string | null;
  verificationStatus?: 'pending' | 'approved' | 'rejected' | null;
  isProfileCompleted?: boolean | null;
  isVerified?: boolean | null;
  workStatus?: boolean | null;
  proofIdentityType?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  profilePhoto?: { id: string; fileName: string; url: string } | null;
  proofIdentityFile?: { id: string; fileName: string; url: string } | null;
  cvFile?: { id: string; fileName: string; url: string } | null;
  pswCertificateFile?: { id: string; fileName: string; url: string } | null;
  immunizationRecordFile?: { id: string; fileName: string; url: string } | null;
  criminalRecordFile?: { id: string; fileName: string; url: string } | null;
  firstAidOrCPRFile?: { id: string; fileName: string; url: string } | null;
  insuranceFile?: { id: string; fileName: string; url: string } | null;
}


