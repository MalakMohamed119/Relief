import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CompleteProfilePayload {
  proofIdentityType: string;
  workStatus: boolean;
  proofIdentityFile: File;
  pswCertificateFile: File;
  cvFile: File;
  immunizationRecordFile: File;
  criminalRecordFile: File;
  firstAidOrCPRFile?: File;
}

@Injectable({
  providedIn: 'root',
})
export class CompleteProfileService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  completeProfile(payload: CompleteProfilePayload): Observable<any> {
    const formData = new FormData();

    formData.append('ProofIdentityType', payload.proofIdentityType);
    formData.append('WorkStatus', String(payload.workStatus));
    formData.append('ProofIdentityFile', payload.proofIdentityFile);
    formData.append('PswCertificateFile', payload.pswCertificateFile);
    formData.append('CVFile', payload.cvFile);
    formData.append('ImmunizationRecordFile', payload.immunizationRecordFile);
    formData.append('CriminalRecordFile', payload.criminalRecordFile);

    if (payload.firstAidOrCPRFile) {
      formData.append('FirstAidOrCPRFile', payload.firstAidOrCPRFile);
    }

    // OpenAPI: POST /api/psw/profile (multipart/form-data)
    return this.http.post<any>(`${this.apiUrl}/api/psw/profile`, formData);
  }
}

