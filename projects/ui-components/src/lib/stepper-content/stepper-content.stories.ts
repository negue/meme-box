import {Meta, moduleMetadata, Story} from '@storybook/angular';

import {StepperContentComponent} from './stepper-content.component';
import {STEPPER_CONTENT_MODULES} from "@memebox/ui-components";
import {StepComponent} from "./step/step.component";

export default {
  title: 'UI-Components/Stepper-Content',
  component: StepperContentComponent,
  decorators: [
    moduleMetadata({
      declarations: [StepperContentComponent, StepComponent],
      imports: STEPPER_CONTENT_MODULES
    })
  ],
} as Meta;

const Template: Story<StepperContentComponent> = (args: StepperContentComponent) => ({
  props: args,
  template: `
  <lib-stepper-content>
    <div stepperHeader> This is a header from the content </div>

    <lib-step label="Test Step" subText="Set Stuff, done"> <p>This is any content of "Step 1"</p> </lib-step>
    <lib-step label="Step 2"> <p>This is any content of "Step 2"</p> </lib-step>
    <lib-step label="Step Reloaded"  subText="Set Stuff, even more changes"> <p>This is any content of "Step 3"</p> </lib-step>
    <lib-step label="Test Revolutions"> <p>This is any content of "Step 4"</p> </lib-step>
    <lib-step label="Step 4"> <p>This is any content of "Step 5"</p> </lib-step>
  </lib-stepper-content>
  `,
});

export const FirstExample = Template.bind({});
FirstExample.args = {
  user: {},
};
