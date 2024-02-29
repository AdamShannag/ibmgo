import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { model } from '../../../../../wailsjs/go/models';

export function createDuplicateQueueValidator(queues: model.Queue[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    const value = control.value;

    if (!value) {
      return null;
    }

    const queue = queues.find(q => q.name === value);

    return (queue != undefined) ? { duplicateQueue: true } : null;
  }
}
