import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PswHome } from './psw-home';

describe('PswHome', () => {
  let component: PswHome;
  let fixture: ComponentFixture<PswHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PswHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PswHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
