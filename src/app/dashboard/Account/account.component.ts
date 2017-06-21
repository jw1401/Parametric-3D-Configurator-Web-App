import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../shared/user.service';
import * as $ from 'jquery';

@Component
({
  selector: 'account',
  templateUrl: './account.component.html'
})

export class AccountComponent
{
  public error : any;
  public success: any;

  constructor(private userService: UserService, private router: Router)
  {}

  updateAccount(accountForm : any)
  {
    this.success = null

    if (accountForm.valid)
    {
      if (accountForm.value.newEmail != null && accountForm.value.newEmail !='')
      {
        this.userService.updateAccountEmail(accountForm.value.newEmail, accountForm.value.email, accountForm.value.password)
        .then((success) => { this.showSuccess(success); })
        .catch((err) =>
          {
            this.error = err;
            //this.router.navigate(['/login']);
          });
      }

      if (accountForm.value.newPassword != null && accountForm.value.newPassword !='')
      {
        this.userService.updateAccountPassword(accountForm.value.newPassword, accountForm.value.email, accountForm.value.password)
          .then((success) =>{ this.showSuccess(success); })
          .catch(err =>
            {
              this.error= err;
              //this.router.navigate(['/login']);
            });
      }

      if (accountForm.value.accountName != null && accountForm.value.accountName !='')
      {
        this.userService.updateAccountName(accountForm.value.accountName)
        .then((success) => { this.showSuccess(success); })
        .catch((err) => { this.error = err });
      }
    }
  }

  showSuccess(success: any)
  {
    this.success = success;
    $(document).ready(function(){$('#success').fadeOut(4000);});
  }


}
