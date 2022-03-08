import {SimpleConfirmationDialogComponent} from "./simple-confirmation-dialog.component";

describe('Simple Confirmation Dialog', () => {
  it('create an instance, without payload properties', () => {
    const component = new SimpleConfirmationDialogComponent({
      title: 'Only with a title'
    });
    expect(component).toBeTruthy();
  });
});
